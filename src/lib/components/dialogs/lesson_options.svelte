<script lang="ts">
	import OptionalNumber from './lesson_overridable/optional_number.svelte';
	import Number from './lesson_overridable/number.svelte';
	import Bool from './lesson_overridable/bool.svelte';
	import Select from './lesson_overridable/select.svelte';

	import { CheckMode, type Config } from '$lib/types/config';
	import { Lesson, addWrappers, type LessonTypingConfig } from '$lib/lessons/lesson';
	import {
		defaultLessonFormState,
		type FormUserValueReturn,
		type LessonFormState
	} from '$lib/types/forms';

	export let config: Config;
	export let lesson: Lesson;
	export let lessonOptions: Partial<LessonTypingConfig>;
	export let db: IDBDatabase;
	db; // suppress the unused-export-let warning from above

	let curLesson: Lesson = lesson;
	let overrides = curLesson.overrides();
	$: overrides = curLesson.overrides();
	let state: LessonFormState = initializeState(config, lessonOptions);

	let waiting = false;
	let dirty = false;

	const wordModeChoices = [
		{
			key: 'words',
			label: config.lang.configCheckModeWords,
			value: CheckMode.WordRepeat
		},
		{ key: 'chars', label: config.lang.configCheckModeChars, value: CheckMode.Char }
	];

	// @ts-ignore
	let dataFns: { [K in keyof LessonFormState]: () => LessonFormState[K] } = {};

	function initializeState(config: Config, opts: Partial<LessonTypingConfig>): LessonFormState {
		// @ts-ignore
		let s: LessonFormState = {};
		let k: keyof LessonTypingConfig;
		for (k in defaultLessonFormState) {
			if (overrides[k] !== 'enabled' && overrides[k] !== 'disabled') {
				// @ts-ignore
				s[k] = overrides[k];
				continue;
			}
			if (opts[k] !== undefined) {
				// @ts-ignore
				s[k] = opts[k];
				continue;
			}
			// @ts-ignore
			s[k] = defaultLessonFormState[k];
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
		const newOpts: { [P in keyof LessonTypingConfig]: FormUserValueReturn<LessonTypingConfig[P]> } =
			{};

		let k: keyof LessonFormState;
		for (k in defaultLessonFormState) {
			if (state[k] === 'user') {
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
		{config}
		id="until"
		label={config.lang.configUntil}
		initialState={state.until}
		defaultValue={100}
		nullLabel={config.lang.infinite}
		min={1}
		step={1}
		override={overrides.until}
	/>

	<Bool
		bind:getState={dataFns.random}
		on:updateForm={updateState}
		{config}
		id="random"
		label={config.lang.configRandom}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.random}
		override={overrides.random}
	/>

	<Number
		bind:getState={dataFns.minQueue}
		on:updateForm={updateState}
		{config}
		id="minQueue"
		label={config.lang.configMinQueue}
		initialState={state.minQueue}
		defaultValue={config.minQueue}
		min={1}
		max={100}
		override={overrides.minQueue}
	/>

	<Number
		bind:getState={dataFns.wordBatchSize}
		on:updateForm={updateState}
		{config}
		id="wordBatchSize"
		label={config.lang.configWordBatchSize}
		initialState={state.wordBatchSize}
		defaultValue={config.wordBatchSize}
		min={1}
		max={100}
		override={overrides.wordBatchSize}
	/>

	<Bool
		bind:getState={dataFns.backspace}
		on:updateForm={updateState}
		{config}
		id="backspace"
		label={config.lang.configAcceptBackspace}
		onLabel={config.lang.accept}
		offLabel={config.lang.ignore}
		initialState={state.backspace}
		override={overrides.backspace}
	/>

	<Select
		bind:getState={dataFns.checkMode}
		on:updateForm={updateState}
		{config}
		id="checkMode"
		label={config.lang.configCheckMode}
		choices={wordModeChoices}
		initialValue={state.checkMode}
		override={overrides.checkMode}
	/>

	<Bool
		bind:getState={dataFns.spaceOptional}
		on:updateForm={updateState}
		{config}
		id="spaceOptional"
		label={config.lang.configSpaceOptional}
		onLabel={config.lang.yes}
		offLabel={config.lang.no}
		initialState={state.spaceOptional}
		override={overrides.spaceOptional}
	/>

	<Bool
		bind:getState={dataFns.adaptive}
		on:updateForm={updateState}
		{config}
		id="adaptive"
		label={config.lang.configAdaptive}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.adaptive}
		override={overrides.adaptive}
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
