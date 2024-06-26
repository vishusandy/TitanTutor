<script lang="ts">
	import type { Config } from '$lib/config';
	import { type StatsLog } from '$lib/stats';
	import { formatDuration, getPluralStrs } from '$lib/util/lang';
	import { calcAverages, toStatsArray } from '$lib/data/stats';
	import { translateStatsKey } from '$lib/util/lang';
	import { lesson_stats_store, remove } from '$lib/db';
	import type { StatsEntry } from '$lib/types/stats';

	export let config: Config;
	export let statsLog: StatsLog;
	export let db: IDBDatabase;
	db;

	const total = statsLog.entries.length;
	let limit: number | undefined = undefined;
	let start: number = 0;
	let stats: StatsLog = { lesson_id: statsLog.lesson_id, entries: statsLog.entries.slice(start, limit) };
	$: stats = { lesson_id: statsLog.lesson_id, entries: statsLog.entries.slice(start, limit) };

	const plurals = getPluralStrs(config.lang, true);
	let avgs = calcAverages(stats);
	let print = toStatsArray(avgs);

	function displayNum(k: keyof StatsEntry, n: number) {
		if (Number.isNaN(n)) {
			return config.lang.notAvailable;
		} else if (k === 'duration') {
			return formatDuration(plurals, n, ' ');
		} else {
			return n.toString();
		}
	}
</script>

<div class="dialog-grid">
	<div class="grid-header" />
	<div class="grid-header key">{config.lang.statsLogAverage}</div>
	<div class="grid-header key">{config.lang.statsLogTotal}</div>

	<div class="key">{config.lang.statsLogSessions}</div>
	<div />
	<div class="value">{avgs.count}</div>

	{#each print as [k, tot, avg]}
		<div class="key" class:duration={k === 'duration'}>{translateStatsKey(config.lang, k)}</div>
		<div class="value" class:duration={k === 'duration'}>
			{displayNum(k, avg)}
		</div>
		<div class="value" class:duration={k === 'duration'}>
			{displayNum(k, tot)}
		</div>
	{/each}

	<div class="merge reset-stats">
		<!-- <button class="danger" on:click={resetStats}>{config.lang.resetStats}</button> -->
	</div>
</div>

<style>
	.dialog-grid {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr;
		column-gap: 2rem;
		/* row-gap: 1.3rem; */
	}

	.reset-stats {
		text-align: center;
	}

	.merge {
		grid-column: 1/4;
	}

	.grid-header {
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.key {
		font-family: var(--font-humanist);
		font-size: 0.95rem;
		font-weight: bold;
		color: #353535;
		/* font-style: italic; */
	}

	.value {
		font-family: var(--font-sans-serif);
		font-size: 0.9rem;
		text-align: center;
	}

	.duration {
		margin-bottom: 1rem;
	}
</style>
