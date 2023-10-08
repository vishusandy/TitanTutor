<script lang="ts" generics="T extends UserStats">
	import type { Config } from '$lib/config';
	import type { UserStats } from '$lib/stats';
	import { formatDuration } from '$lib/util';

	export let stats: T;
	export let config: Config;

	// Inspired by:
	// https://carl-topham.com/articles/intl-number-formatting-percentage
	function formatNaN(fn: () => number, options?: Intl.NumberFormatOptions) {
		const n = fn.bind(stats)();
		return Number.isNaN(n)
			? config.lang.notAvailable
			: Intl.NumberFormat(navigator.language, options).format(n);
	}

	const grossWpm = formatNaN(stats.getGrossWpm, { style: 'decimal', maximumFractionDigits: 2 });
	const netWpm = formatNaN(stats.getNetWpm, { style: 'decimal', maximumFractionDigits: 2 });
	const accuracy = formatNaN(stats.getAccuracy, { style: 'percent' });
</script>

<div class="grid">
	<div class="label">Duration</div>
	<div>{formatDuration(stats.duration, config.lang)}</div>

	<div class="label">{config.lang.statsDialogWords}</div>
	<div>{stats.words}</div>

	<div class="label">{config.lang.statsDialogChars}</div>
	<div>{stats.chars}</div>

	<div class="label">{config.lang.statsDialogKeystrokes}</div>
	<div>{stats.keystrokes}</div>

	<div class="label">{config.lang.statsDialogUncorrectedErrors}</div>
	<div>{stats.uncorrectedErrors}</div>

	<div class="label">{config.lang.statsDialogCorrectedErrors}</div>
	<div>{stats.correctedErrors}</div>

	<div class="label">{config.lang.statsDialogGrossWpm}</div>
	<div>{grossWpm}</div>

	<div class="label">{config.lang.statsDialogNetWpm}</div>
	<div>{netWpm}</div>

	<div class="label">{config.lang.statsDialogAccuracy}</div>
	<div>{accuracy}</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 2rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		width: min-content;
		white-space: nowrap;
	}

	.label {
		align-self: center;
		color: #353535;
		font-style: italic;
		font-weight: 600;
		font-size: 95%;
	}
</style>
