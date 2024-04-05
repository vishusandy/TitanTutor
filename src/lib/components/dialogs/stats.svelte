<script lang="ts" generics="T extends BaseStats">
	import type { Config } from '$lib/config';
	import type { UserStats, BaseStats } from '$lib/stats';
	import { LogStats } from '$lib/types/config';
	import { formatDuration } from '$lib/util/lang';
	import { getPluralStrs } from '$lib/util/lang';

	export let stats: T;
	export let config: Config;
	export let db: IDBDatabase;
	let plurals = getPluralStrs(config.lang);

	const userStats = (stats as unknown as UserStats).sessions !== undefined;

	let grossWpm: string = '';
	let netWpm: string = '';
	let accuracy: string = '';
	let trackStats: LogStats = config.logStats;
	let trackStatsCheckbox: HTMLInputElement;

	export function getData(): boolean {
		return true;
	}

	// Inspired by:
	// https://carl-topham.com/articles/intl-number-formatting-percentage
	function formatNaN(num: number, options?: Intl.NumberFormatOptions) {
		return Number.isNaN(num) ? config.lang.notAvailable : Intl.NumberFormat(navigator.language, options).format(num);
	}

	function calc() {
		grossWpm = formatNaN(stats.getGrossWpm(), { style: 'decimal', maximumFractionDigits: 2 });
		netWpm = formatNaN(stats.getNetWpm(), { style: 'decimal', maximumFractionDigits: 2 });
		accuracy = formatNaN(stats.getAccuracy(), { style: 'percent' });
	}

	calc();

	function clearUserStats() {
		if (!window.confirm(config.lang.statsResetPrompt)) return;

		config.saveUserConfig(db);
		config = config;
		stats.reset();
		stats = stats;
		calc();
	}

	function changeTrackStats() {
		// trackStats = trackStatsCheckbox.checked;
		// config.logStats = trackStats;
		config = config;
		config.saveUserConfig(db);
	}
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

{#if userStats}
	<form>
		<div class="user-options">
			<div class="track-stats-container">
				<input
					id="log-stats"
					type="checkbox"
					checked={trackStats === LogStats.Prompt}
					bind:this={trackStatsCheckbox}
					on:change={changeTrackStats}
				/>
				<label for="log-stats">{config.lang.statsDialogTrackUserStats}</label>
			</div>
			<button type="button" on:click={clearUserStats}>{config.lang.resetStats}</button>
		</div>
	</form>
{/if}

<style>
	.dialog-grid {
		grid-template-columns: auto auto;
		column-gap: 2rem;
		row-gap: 0px;
		margin: 0px auto;
		width: 40ch;
		max-width: var(--max-width);
		white-space: nowrap;
	}

	.dialog-grid > * {
		margin: 0.65rem 0px;
	}

	.dialog-grid :nth-child(2n) {
		text-align: left;
	}

	.dialog-grid :nth-child(2n + 1) {
		text-align: left;
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

	.user-options {
		margin: 2rem 0px 0rem;
		text-align: center;
	}

	.track-stats-container {
		display: flex;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	#log-stats {
		margin-right: 0.4rem;
	}
</style>
