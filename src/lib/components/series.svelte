<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Triangle from './imgs/triangle.svelte';
	import { stockLessons } from '$lib/conf/lessons';
	import { lessonInSeries, lessonPlans } from '$lib/conf/lesson_plans';
	import type { StorableUserWordlist } from '$lib/lessons/base/user_wordlist';
	import type { Language } from '$lib/data/language';

	export let done: boolean;
	export let customLessons: StorableUserWordlist[];
	export let lang: Language;
	export let id: string;

	let seriesId = lessonInSeries.get(id);
	let series = seriesId !== undefined ? lessonPlans.get(seriesId) : undefined;
	let prev: string | null = series?.prev(id) ?? null;
	let next: string | null = series?.next(id) ?? null;

	const dispatch = createEventDispatcher();

	function update(lessonId: string) {
		if (lessonId.startsWith('user_')) {
			prev = null;
			next = null;
			id = lessonId;
			dispatch('lessonChanged', { to: lessonId });
		}

		const seriesId = lessonInSeries.get(lessonId);
		if (seriesId === undefined) return;

		const s = lessonPlans.get(seriesId);
		if (s === undefined) return;
		series = s;
		prev = series.prev(lessonId);
		next = series.next(lessonId);
		id = lessonId;
		dispatch('lessonChanged', { to: lessonId });
	}

	function onLessonSelect(e: Event) {
		const t = <HTMLSelectElement | null>e.target;
		if (!t) return;
		if (window.confirm(lang.stopMsg)) {
			update(t.value);
		} else {
			t.value = id;
		}
	}

	function onPrev(e: Event) {
		if (prev !== null && window.confirm(lang.stopMsg)) {
			update(prev);
		}
	}

	function onNext(e: Event) {
		if (next !== null && window.confirm(lang.stopMsg)) {
			update(next);
		}
	}
</script>

<div class="prev-btn">
	{#if prev !== null}
		<button
			on:click={onPrev}
			class="prev fade-icon"
			class:done
			type="button"
			disabled={prev === null}
			title={lang.seriesPrevLesson}
		>
			<Triangle />
		</button>
	{/if}
</div>
<select
	on:change={onLessonSelect}
	on:click={(e) => e.stopPropagation()}
	title={lang.seriesSelectLesson}
>
	{#if series !== undefined}
		<optgroup label={series.name}>
			{#each series.lessons as l}
				<option value={l} selected={id === l}>{stockLessons.get(l)?.name}</option>
			{/each}
		</optgroup>
	{/if}
	<!-- {#each lessonPlans.values() as s}
		<optgroup label={s.name}>
			{#each s.lessons as l}
				<option value={l} selected={id === l}>{stockLessons.get(l)?.name}</option>
			{/each}
		</optgroup>
	{/each} -->
	{#if customLessons.length !== 0}
		<optgroup label={lang.lessonDialogCustomTitle}>
			{#each customLessons as l (l.id)}
				<option value={l.id} selected={id === l.id}>{l.name}</option>
			{/each}
		</optgroup>{/if}
</select>
<div class="next-btn">
	{#if next !== null}
		<button
			on:click={onNext}
			class="next fade-icon"
			class:done
			type="button"
			disabled={next === null}
			title={lang.seriesNextLesson}
		>
			<Triangle />
		</button>
	{/if}
</div>

<style>
	select {
		background-color: #f7f9fa;
	}

	button {
		width: 2rem;
		height: 2rem;
		padding: 0px;
	}

	.prev-btn,
	.next-btn {
		align-self: center;
		flex-grow: 1;
	}

	.next-btn {
		text-align: end;
	}

	:global(.prev svg) {
		transform: rotate(-90deg);
	}
	:global(.next svg) {
		transform: rotate(90deg);
	}

	:global(button svg) {
		fill: #f5af00;
	}
	:global(button:focus-within svg) {
		fill: #f56800;
	}
</style>
