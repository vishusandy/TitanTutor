<script lang="ts">
	import OptionalNumber from './user_form_inputs/optional_number.svelte';
	import Number from './user_form_inputs/number.svelte';
	import Bool from './user_form_inputs/bool.svelte';
	import Select from './user_form_inputs/select.svelte';

	import { CheckMode, type Config } from '$lib/config';
	import type { Lesson, WordListBase, LessonTypingConfig } from '$lib/lessons/lessons';
	import {
		defaultLessonFormState,
		type FormUserValueReturn,
		type LessonFormState
	} from '$lib/forms';
	import { RandomList } from '$lib/lessons/wrappers/random';
	import { UntilN } from '$lib/lessons/wrappers/until_n';

	export let config: Config;
	export let lesson: Lesson;
	export let lessonConfigOverrides: Partial<LessonTypingConfig>;

	const state: LessonFormState = getFormState(lesson, config);

	console.log('[form] user config:', config.lessonConfig());
	console.log('[form] overrides:', lessonConfigOverrides);
	console.log('[form] final:', config.lessonConfigOverrides(lessonConfigOverrides));

	console.log('[form] form state:', state);

	const wordModeChoices = [
		{
			key: 'words',
			label: config.lang.lessonConfigDialogCheckModeWords,
			value: CheckMode.WordRepeat
		},
		{ key: 'chars', label: config.lang.lessonConfigDialogCheckModeChars, value: CheckMode.Char }
	];

	let untilData: () => FormUserValueReturn<number | null>;
	let randomData: () => FormUserValueReturn<boolean>;
	let minQueueData: () => FormUserValueReturn<number>;
	let wordBatchSizeData: () => FormUserValueReturn<number>;
	let backspaceData: () => FormUserValueReturn<boolean>;
	let checkModeData: () => FormUserValueReturn<CheckMode>;

	export function getData(): [Lesson, Partial<LessonTypingConfig>] {
		const lessonOverrides: Partial<LessonTypingConfig> = {
			until: untilData(),
			random: randomData(),
			minQueue: minQueueData(),
			wordBatchSize: wordBatchSizeData(),
			backspace: backspaceData(),
			checkMode: checkModeData()
		};

		let l: Lesson;
		if (randomData() === true && lesson.baseLesson().getType() === 'wordlist') {
			l = new RandomList(lesson as WordListBase);
		} else {
			l = lesson;
		}

		const max = untilData();
		if (typeof max === 'number') {
			l = new UntilN(l, max);
		}

		return [l, lessonOverrides];
	}

	function getFormState(lesson: Lesson, config: Config): LessonFormState {
		let s: LessonFormState = {
			...defaultLessonFormState
		};

		console.log('getFormState:', s);
		for (const key in lessonConfigOverrides) {
			// @ts-ignore
			if (lessonConfigOverrides[key] !== undefined) {
				// @ts-ignore
				s[key] = lessonConfigOverrides[key];
			}
		}

		console.log('getFormState2:', s);
		console.log('getFormState spread operator:', { ...s, ...lessonConfigOverrides });

		if (lesson.baseLesson().getType() !== 'wordlist') {
			s.random = 'disabled';
		}

		let c: Lesson | undefined = lesson;
		while ((c = c.getChild())) c.setFormState(s);
		return s;
	}
</script>

<div class="grid">
	<OptionalNumber
		bind:getData={untilData}
		{config}
		id="until"
		label={config.lang.lessonConfigDialogUntil}
		initialState={state.until}
		defaultValue={100}
		nullLabel={config.lang.infinite}
		min={10}
		step={1}
	/>

	<Bool
		bind:getData={randomData}
		{config}
		id="random"
		label={config.lang.lessonConfigDialogRandom}
		onLabel={config.lang.on}
		offLabel={config.lang.off}
		initialState={state.random}
	/>

	<Number
		bind:getData={minQueueData}
		{config}
		id="min-queue"
		label={config.lang.lessonConfigDialogMinQueue}
		initialState={state.minQueue}
		defaultValue={config.minQueue}
		min={1}
		max={100}
	/>

	<Number
		bind:getData={wordBatchSizeData}
		{config}
		id="word-batch-size"
		label={config.lang.lessonConfigDialogWordBatchSize}
		initialState={state.wordBatchSize}
		defaultValue={config.wordBatchSize}
		min={1}
		max={100}
	/>

	<Bool
		bind:getData={backspaceData}
		{config}
		id="accept-backspace"
		label={config.lang.lessonConfigDialogAcceptBackspace}
		onLabel={config.lang.accept}
		offLabel={config.lang.ignore}
		initialState={state.backspace}
	/>

	<Select
		bind:getData={checkModeData}
		{config}
		id="check-mode"
		label={config.lang.lessonConfigDialogCheckMode}
		choices={wordModeChoices}
		initialValue={state.checkMode}
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
