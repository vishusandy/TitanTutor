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
	<button on:click={onPrev} class="prev" class:done type="button" disabled={prev === null}>
		<Triangle />
	</button>
	<select on:change={onLessonSelect} on:click={(e) => e.stopPropagation()}>
		{#each lessonPlans.values() as s}
			<optgroup label={s.name}>
				{#each s.lessons as l}
					<option value={l} selected={id === l}>{stockLessons.get(l)?.name}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
	<button on:click={onNext} class="next" class:done type="button" disabled={next === null}>
		<Triangle />
	</button>
</div>

<style>
	div {
		font-size: 1.2rem;
		display: flex;
		align-items: center;
	}

	button {
		width: 2.4rem;
		height: 2.4rem;
		justify-content: center;
		margin: 0px;
		padding: 0.2rem;
		background: transparent;
		box-shadow: 0 0 !important;
		box-sizing: border-box;
	}

	div :global(.prev svg) {
		transform: rotate(-90deg);
	}
	div :global(.next svg) {
		transform: rotate(90deg);
	}

	div :global(button svg) {
		fill: rgb(136, 216, 47);
		filter: grayscale(100%);
	}

	div :global(button:disabled svg) {
		stroke-width: 0px;
		fill: #afb2c2;
	}

	div :global(button:not(:disabled) svg) {
		stroke-width: 10px;
		stroke: #000;
	}

	div :global(button.done:not(:disabled) svg) {
		filter: grayscale(0%);
	}
	div :global(button:not(:disabled) svg:hover) {
		stroke-width: 20px;
		stroke: #000;
		/* box-shadow: 0 0 !important; */
		filter: grayscale(0%);
		/* filter: drop-shadow(0px 0px 2px #000); */
	}
	div :global(button:not(:disabled):focus-within svg) {
		stroke-width: 25px;
		stroke: #000;
		filter: drop-shadow(2px -2px 2px #0000008f);
		/* filter: grayscale(0%); */
		/* fill: rgb(87, 136, 30); */
	}
</style>
