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
		console.log(`changing to ${lessonId}`);
		const seriesId = lessonInSeries.get(lessonId);
		if (seriesId === undefined) return;

		const s = lessonPlans.get(seriesId);
		if (s === undefined) return;
		series = s;
		prev = series.prev(lessonId);
		next = series.next(lessonId);
		console.log(`changing to ${lessonId} prev=${prev} next=${next}`);
		id = lessonId;
		dispatch('lessonChanged', { to: lessonId });
	}
	function onLessonSelect(e: Event) {
		const t = <HTMLSelectElement | null>e.target;
		if (!t) return;
		if (window.confirm(stopMsg)) {
			update(t.value);
		} else {
			console.log(`value was ${id}, setting to ${t.value}`);
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

<div>
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
	<select on:change={onLessonSelect} on:click={(e) => e.stopPropagation()} title={lessonSelectText}>
		{#each lessonPlans.values() as s}
			<optgroup label={s.name}>
				{#each s.lessons as l}
					<option value={l} selected={id === l}>{stockLessons.get(l)?.name}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
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
	div {
		font-size: 1.2rem;
		display: flex;
		/* flex-wrap: wrap; */
		align-items: center;
	}

	select {
		background-color: #f7f9fa;
		box-shadow: none;
		width: 70%;
		flex-shrink: 2;
	}

	button {
		width: 2.4rem;
		height: 2.4rem;
	}

	div :global(.prev svg) {
		transform: rotate(-90deg);
	}
	div :global(.next svg) {
		transform: rotate(90deg);
	}

	div :global(button svg) {
		fill: #f5af00;
	}
	div :global(button:focus-within svg) {
		fill: #f56800;
	}
</style>
