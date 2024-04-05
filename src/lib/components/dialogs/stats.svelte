<script lang="ts" generics="T extends BaseStats">
	import type { Config } from '$lib/config';
	import type { BaseStats } from '$lib/stats';
	import { formatDuration } from '$lib/util/lang';
	import { getPluralStrs } from '$lib/util/lang';
	import { formatNaN } from '$lib/util/util';

	export let stats: T;
	export let config: Config;

	let plurals = getPluralStrs(config.lang);
	let grossWpm: string = '';
	let netWpm: string = '';
	let accuracy: string = '';

	export function getData(): boolean {
		return true;
	}

	function calc() {
		grossWpm = formatNaN(config.lang, stats.getGrossWpm(), { style: 'decimal', maximumFractionDigits: 2 });
		netWpm = formatNaN(config.lang, stats.getNetWpm(), { style: 'decimal', maximumFractionDigits: 2 });
		accuracy = formatNaN(config.lang, stats.getAccuracy(), { style: 'percent' });
	}

	calc();
</script>

<div class="dialog-grid">
	<div class="label">{config.lang.statsDialogWords}</div>
	<div>{stats.words}</div>

	<div class="label">{config.lang.statsDialogChars}</div>
	<div>{stats.chars}</div>

	<div class="label">{config.lang.statsDialogKeystrokes}</div>
	<div>{stats.keystrokes}</div>
</div>
<hr />
<div class="dialog-grid">
	<div class="label">Duration</div>
	<div>{formatDuration(plurals, stats.duration)}</div>

	<div class="label">{config.lang.statsDialogUncorrectedErrors}</div>
	<div>{stats.uncorrectedErrors}</div>

	<div class="label">{config.lang.statsDialogCorrectedErrors}</div>
	<div>{stats.correctedErrors}</div>
</div>
<hr />
<div class="dialog-grid">
	<div class="label">{config.lang.statsDialogGrossWpm}</div>
	<div>{grossWpm}</div>

	<div class="label">{config.lang.statsDialogNetWpm}</div>
	<div>{netWpm}</div>

	<div class="label">{config.lang.statsDialogAccuracy}</div>
	<div>{accuracy}</div>
</div>

<style>
	.dialog-grid {
		grid-template-columns: 3fr 2fr;
		column-gap: 2rem;
		row-gap: 0px;
		margin: 0px auto;
		min-width: 35ch;
		max-width: var(--max-width);
		white-space: nowrap;
	}

	.dialog-grid > * {
		margin: 0.65rem 0px;
	}

	hr {
		margin: 0.325rem auto;
		grid-column: span 2;
		height: 1px;
		border: 0px;
		width: 80%;
		opacity: 0.5;
		background-color: #b2b8be;
		background: linear-gradient(
			90deg,
			rgba(178, 184, 190, 0) 0%,
			rgba(178, 184, 190, 0.8981793400954132) 10%,
			rgba(178, 184, 190, 1) 20%,
			rgba(178, 184, 190, 1) 80%,
			rgba(178, 184, 190, 0.9037815809917717) 90%,
			rgba(178, 184, 190, 0) 100%
		);
	}
</style>
