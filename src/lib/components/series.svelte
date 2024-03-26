<script lang="ts">
	import { Series } from '$lib/lessons/series';
	import { createEventDispatcher } from 'svelte';
	import Triangle from './imgs/triangle.svelte';
	import { stockLessons } from '$lib/conf/lessons';
	import { lessonInSeries, lessonPlans } from '$lib/conf/lesson_plans';

	export let series: Series;
	export let seriesIndex: number;
	export let done: boolean;
	export let stopMsg: string;
	export let prevText: string;
	export let nextText: string;
	export let lessonSelectText: string;

	let id = series.lessons[seriesIndex];
	let prev = series.prev(id);
	let next = series.next(id);

	const dispatch = createEventDispatcher();

	function update(lessonId: string) {
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
		if (window.confirm(stopMsg)) {
			update(t.value);
		} else {
			t.value = id;
		}
	}

	function onPrev(e: Event) {
		if (prev !== null && window.confirm(stopMsg)) {
			update(prev);
		}
	}

	function onNext(e: Event) {
		if (next !== null && window.confirm(stopMsg)) {
			update(next);
		}
	}
</script>

<div class="prev-btn">
	<button
		on:click={onPrev}
		class="prev fade-icon"
		class:done
		type="button"
		disabled={prev === null}
		title={prevText}
	>
		<Triangle />
	</button>
</div>
<select on:change={onLessonSelect} on:click={(e) => e.stopPropagation()} title={lessonSelectText}>
	{#each lessonPlans.values() as s}
		<optgroup label={s.name}>
			{#each s.lessons as l}
				<option value={l} selected={id === l}>{stockLessons.get(l)?.name}</option>
			{/each}
		</optgroup>
	{/each}
</select>
<div class="next-btn">
	<button
		on:click={onNext}
		class="next fade-icon"
		class:done
		type="button"
		disabled={next === null}
		title={nextText}
	>
		<Triangle />
	</button>
</div>

<style>
	select {
		background-color: #f7f9fa;
		/* flex-grow: 1; */
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
