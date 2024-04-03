<script lang="ts">
	import type { Config } from '$lib/config';
	import { type StatsLog, type BaseStats } from '$lib/stats';
	import { formatDuration } from '$lib/util/lang';
	import { defaultStats } from '$lib/data/stats';
	import type { StatsEntry } from '$lib/types/stats';
	import { calcAverages, toStatsArray } from '$lib/data/stats';
	import { translateStatsKey } from '$lib/util/lang';

	export let config: Config;
	export let db: IDBDatabase;
	export let stats: StatsLog;
	export let lesson_id: string;
	export let lesson_name: string;

	const avgs = calcAverages(stats);
	const print = toStatsArray(avgs);
</script>

<div class="dialog-grid">
	<div />
	<div class="label">{config.lang.statsLogTotal}</div>
	<div class="label">{config.lang.statsLogAverage}</div>

	<div class="label">{config.lang.statsLogSessions}</div>
	<div class="value">{avgs.count}</div>
	<div />

	{#each print as e}
		<div class="label">{translateStatsKey(config.lang, e[0])}</div>
		<div class="value">{e[1]}</div>
		<div class="value">{e[2]}</div>
	{/each}
</div>

<style>
	.dialog-grid {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr;
		column-gap: 2rem;
		/* row-gap: 1.3rem; */
	}

	.value {
		/* font-family: var(--font-humanist); */
	}
</style>
