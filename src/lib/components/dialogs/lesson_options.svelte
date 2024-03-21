<script lang="ts">
	import OptionalNumber from './overridable_inputs/optional_number.svelte';
	import Number from './overridable_inputs/number.svelte';
	import Bool from './overridable_inputs/bool.svelte';
	import Select from './overridable_inputs/select.svelte';

	import type { Config } from '$lib/config';
	import type { Lesson } from '$lib/lessons/lesson';
	import { addWrappers } from '$lib/data/lesson_classes';
	import type { LessonTypingConfig } from '$lib/types/lessons';
	import {
		defaultLessonFormState,
		type FormValueReturn,
		type LessonFormState
	} from '$lib/types/forms';
	import { CheckMode } from '$lib/types/types';

	export let config: Config;
	export let lesson: Lesson;
	export let lessonOptions: Partial<LessonTypingConfig>;
	export let db: IDBDatabase;
	db; // suppress the unused-export-let warning from above

	let curLesson: Lesson = lesson;
	let overrides = curLesson.overrides();
	$: overrides = curLesson.overrides();
	let state: LessonFormState = initializeState(lessonOptions);

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

	function initializeState(opts: Partial<LessonTypingConfig>): LessonFormState {
		// @ts-ignore
		let s: LessonFormState = {};
		let k: keyof LessonTypingConfig;
		for (k in defaultLessonFormState) {
			if (overrides[k] !== 'enabled' && overrides[k] !== 'disabled') {
				// @ts-ignore
				s[k] = overrides[k];
			} else if (opts[k] !== undefined) {
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

		curLesson = await addWrappers(lesson.baseLesson(), config, db, state);
		overrides = curLesson.overrides();
		state = state;

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

		const newLesson = await addWrappers(lesson.baseLesson(), config, db, state);
		return [newLesson, newOpts];
	}
</script>

<div class="grid">
	<OptionalNumber
		bind:getState={dataFns.until}
		on:updateForm={updateState}
		id="until"
		label={config.lang.configUntil}
		initialState={state.until}
		defaultValue={100}
		nullLabel={config.lang.infinite}
		min={1}
		step={1}
		override={overrides.until}
		inheritValue={config.until}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Bool
		bind:getState={dataFns.random}
		on:updateForm={updateState}
		id="random"
		label={config.lang.configRandom}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.random}
		override={overrides.random}
		inheritValue={config.random}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Number
		bind:getState={dataFns.minQueue}
		on:updateForm={updateState}
		id="minQueue"
		label={config.lang.configMinQueue}
		initialState={state.minQueue}
		defaultValue={config.minQueue}
		min={1}
		max={100}
		override={overrides.minQueue}
		inheritValue={config.minQueue}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Number
		bind:getState={dataFns.wordBatchSize}
		on:updateForm={updateState}
		id="wordBatchSize"
		label={config.lang.configWordBatchSize}
		initialState={state.wordBatchSize}
		defaultValue={config.wordBatchSize}
		min={1}
		max={100}
		override={overrides.wordBatchSize}
		inheritValue={config.wordBatchSize}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Bool
		bind:getState={dataFns.backspace}
		on:updateForm={updateState}
		id="backspace"
		label={config.lang.configAcceptBackspace}
		onLabel={config.lang.accept}
		offLabel={config.lang.ignore}
		initialState={state.backspace}
		override={overrides.backspace}
		inheritValue={config.backspace}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Select
		bind:getState={dataFns.checkMode}
		on:updateForm={updateState}
		id="checkMode"
		label={config.lang.configCheckMode}
		choices={wordModeChoices}
		initialValue={state.checkMode}
		override={overrides.checkMode}
		inheritValue={wordModeChoices[config.checkMode].key}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Bool
		bind:getState={dataFns.spaceOptional}
		on:updateForm={updateState}
		id="spaceOptional"
		label={config.lang.configSpaceOptional}
		onLabel={config.lang.yes}
		offLabel={config.lang.no}
		initialState={state.spaceOptional}
		override={overrides.spaceOptional}
		inheritValue={config.spaceOptional}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Bool
		bind:getState={dataFns.adaptive}
		on:updateForm={updateState}
		id="adaptive"
		label={config.lang.configAdaptive}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.adaptive}
		override={overrides.adaptive}
		inheritValue={config.adaptive}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>

	<Bool
		bind:getState={dataFns.caseSensitive}
		on:updateForm={updateState}
		id="caseSensitive"
		label={config.lang.configCaseSensitive}
		onLabel={config.lang.caseSensitive}
		offLabel={config.lang.caseInsensitive}
		initialState={state.caseSensitive}
		override={overrides.caseSensitive}
		inheritValue={config.caseSensitive}
		inheritLabel={config.lang.useUserValue}
		overrideLabel={config.lang.disabledLabel}
	/>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 2rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		min-width: 40ch;
		width: min-content;
	}
</style>
