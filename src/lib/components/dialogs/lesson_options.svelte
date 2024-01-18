<script lang="ts">
	import OptionalNumber from './lesson_overridable/optional_number.svelte';
	import Number from './lesson_overridable/number.svelte';
	import Bool from './lesson_overridable/bool.svelte';
	import Select from './lesson_overridable/select.svelte';

	import { CheckMode, type Config } from '$lib/types/config';
	import { Lesson, type LessonTypingConfig } from '$lib/lessons/lesson';
	import {
		defaultLessonFormState,
		type FormUserValueReturn,
		type LessonFormState
	} from '$lib/types/forms';

	export let db: IDBDatabase;
	export let config: Config;
	export let lesson: Lesson;
	export let lessonOptions: Partial<LessonTypingConfig>;
	db; // suppress the unused-export-let warning from above

	let overrides = lesson.overrides();

	const state: LessonFormState = getFormState(lesson, config, lessonOptions);

	const wordModeChoices = [
		{
			key: 'words',
			label: config.lang.configCheckModeWords,
			value: CheckMode.WordRepeat
		},
		{ key: 'chars', label: config.lang.configCheckModeChars, value: CheckMode.Char }
	];

	let untilDataFn: () => FormUserValueReturn<number | null>;
	let randomDataFn: () => FormUserValueReturn<boolean>;
	let minQueueDataFn: () => FormUserValueReturn<number>;
	let wordBatchSizeDataFn: () => FormUserValueReturn<number>;
	let backspaceDataFn: () => FormUserValueReturn<boolean>;
	let checkModeDataFn: () => FormUserValueReturn<CheckMode>;

	export function getData(): [Lesson, Partial<LessonTypingConfig>] {
		const lessonOptions: Partial<LessonTypingConfig> = {
			until: untilDataFn(),
			random: randomDataFn(),
			minQueue: minQueueDataFn(),
			wordBatchSize: wordBatchSizeDataFn(),
			backspace: backspaceDataFn(),
			checkMode: checkModeDataFn()
		};

		const userOverrides = config.lessonOptions(lessonOptions);
		const result = Lesson.addWrappers(lesson.baseLesson(), userOverrides);

		return [result, lessonOptions];
	}

	function getFormState(
		lesson: Lesson,
		config: Config,
		lessonOptions: Partial<LessonTypingConfig>
	): LessonFormState {
		let s: LessonFormState = {
			...defaultLessonFormState
		};

		for (const key in lessonOptions) {
			// @ts-ignore
			if (lessonOptions[key] !== undefined) {
				// @ts-ignore
				s[key] = lessonOptions[key];
			}
		}

		if (lesson.baseLesson().getType() !== 'wordlist') {
			s.random = 'disabled';
		}

		return s;
	}
</script>

<div class="grid">
	<OptionalNumber
		bind:getData={untilDataFn}
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
		bind:getData={randomDataFn}
		{config}
		id="random"
		label={config.lang.configRandom}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={Lesson.allowRandom(lesson.baseLesson().getType()) ? state.random : 'disabled'}
		override={overrides.random}
	/>

	<Number
		bind:getData={minQueueDataFn}
		{config}
		id="min-queue"
		label={config.lang.configMinQueue}
		initialState={state.minQueue}
		defaultValue={config.minQueue}
		min={1}
		max={100}
		override={overrides.minQueue}
	/>

	<Number
		bind:getData={wordBatchSizeDataFn}
		{config}
		id="word-batch-size"
		label={config.lang.configWordBatchSize}
		initialState={state.wordBatchSize}
		defaultValue={config.wordBatchSize}
		min={1}
		max={100}
		override={overrides.wordBatchSize}
	/>

	<Bool
		bind:getData={backspaceDataFn}
		{config}
		id="accept-backspace"
		label={config.lang.configAcceptBackspace}
		onLabel={config.lang.accept}
		offLabel={config.lang.ignore}
		initialState={state.backspace}
		override={overrides.backspace}
	/>

	<Select
		bind:getData={checkModeDataFn}
		{config}
		id="check-mode"
		label={config.lang.configCheckMode}
		choices={wordModeChoices}
		initialValue={state.checkMode}
		override={overrides.checkMode}
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
