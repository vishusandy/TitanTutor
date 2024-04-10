<script lang="ts">
	import OverridableBool from './overridable_inputs/overridable_bool.svelte';
	import OverridableNumber from './overridable_inputs/overridable_number.svelte';
	import OverridableOptionalNumber from './overridable_inputs/overridable_optional_number.svelte';
	import OverridableSelect from './overridable_inputs/overridable_select.svelte';

	import type { Config } from '$lib/config';
	import { Lesson } from '$lib/lessons/lesson';
	import { addWrappers, getLessonClass } from '$lib/data/lesson_classes';
	import type { LessonTypingConfig } from '$lib/types/lessons';
	import {
		defaultLessonFormState,
		defaultLessonOptsAvail,
		type FormValueReturn,
		type LessonFormState
	} from '$lib/types/forms';
	import { CheckMode } from '$lib/types/types';
	import { adaptive_typeid } from '$lib/conf/lesson_ids';
	import type { TypoData } from '$lib/lessons/base/adaptive_list';
	import { adaptive_store, remove } from '$lib/db';
	
	export let config: Config;
	export let originalLesson: Lesson;
	export let lessonOptions: Partial<LessonTypingConfig>;
	export let adaptiveData: TypoData | undefined;
	export let db: IDBDatabase;
	db; // suppress the unused-export-let warning from above

	// @ts-ignore
	let overrideSources: { [K in keyof LessonFormState]: string } = {};
	let curLesson: Lesson = originalLesson;
	let overrides = curLesson.overrides();
	let state: LessonFormState = initializeState(lessonOptions);
	setOverrideLabels();

	let waiting = false;
	let dirty = false;

	const wordModeChoices = [
		{ key: 'chars', label: config.lang.configCheckModeChars, value: CheckMode.Char },
		{
			key: 'words',
			label: config.lang.configCheckModeWords,
			value: CheckMode.WordRepeat
		}
	];

	// @ts-ignore
	let dataFns: { [K in keyof LessonFormState]: () => LessonFormState[K] } = {};

	function overrideMessage(k: keyof LessonTypingConfig): string {
		let classes = Lesson.listClasses(curLesson).reverse();
		let first: boolean = true;

		for (const c of classes) {
			if (c.overrides()[k] !== 'enabled') {
				const l = getLessonClass(c.getType());
				if (l === undefined) {
					first = false;
					continue;
				}

				const incompat =
					first && l.classId !== adaptive_typeid ? config.lang.incompatibleLesson : config.lang.incompatibleWrapper;

				return incompat.replace('%s', l.name(config.lang));
			}
			first = false;
		}

		return '';
	}

	function setOverrideLabels() {
		let k: keyof LessonTypingConfig;
		for (k in defaultLessonOptsAvail) {
			if (overrides[k] === 'enabled') {
				continue;
			}
			overrideSources[k] = overrideMessage(k);
		}
	}

	function initializeState(opts: Partial<LessonTypingConfig>): LessonFormState {
		// @ts-ignore
		let s: LessonFormState = {};
		let k: keyof LessonTypingConfig;
		for (k in defaultLessonFormState) {
			if (overrides[k] !== 'enabled' && overrides[k] !== 'disabled') {
				// forced to specific value by overrides
				// @ts-ignore
				s[k] = overrides[k];
			} else if (overrides[k] === 'disabled') {
				// @ts-ignore
				s[k] = 'disabled';
			} else if (opts[k] !== undefined) {
				// use stored value
				// @ts-ignore
				s[k] = opts[k];
			} else {
				// @ts-ignore
				s[k] = defaultLessonFormState[k];
			}
		}

		return s;
	}

	async function updateState() {
		if (waiting === true) {
			dirty = true;
			return;
		}

		waiting = true;

		let k: keyof LessonFormState;
		for (k in defaultLessonFormState) {
			// @ts-ignore
			state[k] = dataFns[k]();
		}

		curLesson = await addWrappers(originalLesson.baseLesson(), config, db, state);
		overrides = curLesson.overrides();
		state = state;
		overrideSources = overrideSources;

		setOverrideLabels();

		waiting = false;
		if (dirty === true) {
			dirty = false;
			updateState();
		}
	}

	export async function getData(): Promise<[Lesson, Partial<LessonTypingConfig>]> {
		// @ts-ignore
		const newOpts: { [P in keyof LessonTypingConfig]: FormValueReturn<LessonTypingConfig[P]> } = {};

		let k: keyof LessonFormState;
		for (k in defaultLessonFormState) {
			if (state[k] === 'inherit') {
				newOpts[k] = undefined;
			} else {
				// @ts-ignore
				newOpts[k] = state[k];
			}
		}

		const newLesson = await addWrappers(originalLesson.baseLesson(), config, db, state);
		return [newLesson, newOpts];
	}

	function clearAdaptiveData() {
		if (window.confirm(config.lang.lessonConfigClearAdaptiveConfirm.replace('%s', curLesson.baseLesson().name))) {
			remove(db, adaptive_store, curLesson.baseLesson().id);
			adaptiveData = undefined;
		}
	}
</script>

<div class="dialog-grid">
	<OverridableOptionalNumber
		bind:getState={dataFns.until}
		on:updateForm={updateState}
		id="until"
		label={config.lang.configUntil}
		initialState={state.until}
		nullLabel={config.lang.infinite}
		min={1}
		step={1}
		override={overrides.until}
		inheritValue={config.until}
		overrideMessage={overrideSources.until}
	/>

	<OverridableSelect
		bind:getState={dataFns.checkMode}
		on:updateForm={updateState}
		id="checkMode"
		label={config.lang.configCheckMode}
		choices={wordModeChoices}
		initialState={state.checkMode}
		override={overrides.checkMode}
		inheritValue={wordModeChoices[config.checkMode].key}
		overrideMessage={overrideSources.checkMode}
	/>
	<OverridableBool
		bind:getState={dataFns.random}
		on:updateForm={updateState}
		id="random"
		label={config.lang.configRandom}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.random}
		override={overrides.random}
		inheritValue={config.random}
		overrideMessage={overrideSources.random}
	/>

	<OverridableBool
		bind:getState={dataFns.backspace}
		on:updateForm={updateState}
		id="backspace"
		label={config.lang.configAcceptBackspace}
		onLabel={config.lang.accept}
		offLabel={config.lang.ignore}
		initialState={state.backspace}
		override={overrides.backspace}
		inheritValue={config.backspace}
		overrideMessage={overrideSources.backspace}
	/>

	<OverridableBool
		bind:getState={dataFns.adaptive}
		on:updateForm={updateState}
		id="adaptive"
		label={config.lang.configAdaptive}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.adaptive}
		override={overrides.adaptive}
		inheritValue={config.adaptive}
		overrideMessage={overrideSources.adaptive}
	/>

	{#if adaptiveData}
		<div class="clear-adaptive">
			<button class="danger" on:click={clearAdaptiveData}>{config.lang.lessonConfigClearAdaptive}</button>
		</div>
	{/if}

	<OverridableBool
		bind:getState={dataFns.spaceOptional}
		on:updateForm={updateState}
		id="spaceOptional"
		label={config.lang.configSpaceOptional}
		onLabel={config.lang.yes}
		offLabel={config.lang.no}
		initialState={state.spaceOptional}
		override={overrides.spaceOptional}
		inheritValue={config.spaceOptional}
		overrideMessage={overrideSources.spaceOptional}
	/>

	<OverridableBool
		bind:getState={dataFns.caseSensitive}
		on:updateForm={updateState}
		id="caseSensitive"
		label={config.lang.configCaseSensitive}
		onLabel={config.lang.caseSensitive}
		offLabel={config.lang.caseInsensitive}
		initialState={state.caseSensitive}
		override={overrides.caseSensitive}
		inheritValue={config.caseSensitive}
		overrideMessage={overrideSources.caseSensitive}
	/>

	<OverridableNumber
		bind:getState={dataFns.minQueue}
		on:updateForm={updateState}
		id="minQueue"
		label={config.lang.configMinQueue}
		initialState={state.minQueue}
		min={1}
		max={100}
		override={overrides.minQueue}
		inheritValue={config.minQueue}
		overrideMessage={overrideSources.minQueue}
	/>

	<OverridableNumber
		bind:getState={dataFns.wordBatchSize}
		on:updateForm={updateState}
		id="wordBatchSize"
		label={config.lang.configWordBatchSize}
		initialState={state.wordBatchSize}
		min={1}
		max={100}
		override={overrides.wordBatchSize}
		inheritValue={config.wordBatchSize}
		overrideMessage={overrideSources.wordBatchSize}
	/>
</div>

<style>
	.dialog-grid {
		grid-template-columns: auto auto;
		align-content: center;
	}

	.clear-adaptive {
		grid-column: 2/3;
		text-align: center;
		margin-top: -1rem;
	}

	/* .grid-sep {
		grid-column: 1/3;
		border-bottom: 1px solid #e0e0e0;
		width: 100%;
	} */

	:global(.grid .optional > input:first-child) {
		align-self: start;
		margin-right: 0.5em;
	}
	:global(.grid .optional > label) {
		align-self: start;
	}
</style>
