<script lang="ts">
	import OptionalNumber from './user_form_inputs/optional_number.svelte';
	import Number from './user_form_inputs/number.svelte';
	import Bool from './user_form_inputs/bool.svelte';
	// import

	import type { Config, LessonTypingConfig } from '$lib/config';
	import type { Lesson } from '$lib/lessons/lessons';
	import { defaultLessonFormState, type LessonFormState } from '$lib/forms';

	export let config: Config;
	export let lesson: Lesson;
	export let lessonConfigOverrides: Partial<LessonTypingConfig>;

	const state: LessonFormState = getFormState(lesson);

	function getFormState(lesson: Lesson): LessonFormState {
		let s: LessonFormState = { ...defaultLessonFormState, ...lessonConfigOverrides };
		let c: Lesson | undefined = lesson;
		while ((c = c.getChild())) c.setFormState(s);
		return s;
	}

	export function getData(): undefined {
		return;
	}
</script>

<div class="grid">
	<OptionalNumber
		{config}
		label={config.lang.lessonConfigDialogUntil}
		initialState={state.until}
		defaultValue={100}
		min={10}
		step={1}
	/>
	<Number
		{config}
		label={config.lang.lessonConfigDialogMinQueue}
		initialState={state.minQueue}
		defaultValue={config.minQueue}
		min={1}
		max={100}
	/>
	<Number
		{config}
		label={config.lang.lessonConfigDialogWordBatchSize}
		initialState={state.wordBatchSize}
		defaultValue={config.wordBatchSize}
		min={1}
		max={100}
	/>
	<Bool
		{config}
		label={config.lang.lessonConfigDialogAcceptBackspace}
		onLabel={config.lang.accept}
		offLabel={config.lang.ignore}
		initialState={true}
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
