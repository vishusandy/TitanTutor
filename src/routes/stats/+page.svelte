<script lang="ts">
	import type { PageData } from '../$types';

	import type { UserStats } from '$lib/stats';
	import { formatDuration } from '$lib/util/util';
	import { goto } from '$app/navigation';

	export let data: PageData;
	let db = data.db;
	let config = data.config;

	let stats = config.userStats;
	const userStats = (stats as unknown as UserStats).sessions !== undefined;

	let grossWpm: string = '';
	let netWpm: string = '';
	let accuracy: string = '';
	let trackStats: boolean = config.logStats;
	let trackStatsCheckbox: HTMLInputElement;

	export function getData(): boolean {
		return true;
	}

	// Inspired by:
	// https://carl-topham.com/articles/intl-number-formatting-percentage
	function formatNaN(num: number, options?: Intl.NumberFormatOptions) {
		return Number.isNaN(num)
			? config.lang.notAvailable
			: Intl.NumberFormat(navigator.language, options).format(num);
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
		trackStats = trackStatsCheckbox.checked;
		config.logStats = trackStats;
		config = config;
		config.saveUserConfig(db);
	}
	function cancel() {
		goto('/');
	}
</script>

<header>
	<h1>{config.lang.statsDialogUserTitle}</h1>
</header>
<div class="grid-container">
	<div class="grid">
		<div class="label">{config.lang.statsDialogWords}</div>
		<div>{stats.words}</div>

		<div class="label">{config.lang.statsDialogChars}</div>
		<div>{stats.chars}</div>

		<div class="label">{config.lang.statsDialogKeystrokes}</div>
		<div>{stats.keystrokes}</div>
		<!-- </div> -->
		<!-- <div class="grid"> -->
		<div class="label">Duration</div>
		<div>{formatDuration(stats.duration, config.lang)}</div>

		<div class="label">{config.lang.statsDialogUncorrectedErrors}</div>
		<div>{stats.uncorrectedErrors}</div>

		<div class="label">{config.lang.statsDialogCorrectedErrors}</div>
		<div>{stats.correctedErrors}</div>
		<!-- </div> -->
		<!-- <div class="grid"> -->
		<div class="label">{config.lang.statsDialogGrossWpm}</div>
		<div>{grossWpm}</div>

		<div class="label">{config.lang.statsDialogNetWpm}</div>
		<div>{netWpm}</div>

		<div class="label">{config.lang.statsDialogAccuracy}</div>
		<div>{accuracy}</div>
	</div>

	<div class="actions">
		<form>
			<div class="track-stats-container">
				<input
					id="log-stats"
					type="checkbox"
					checked={trackStats}
					bind:this={trackStatsCheckbox}
					on:change={changeTrackStats}
				/>
				<label for="log-stats">{config.lang.statsDialogTrackUserStats}</label>
			</div>
			<button type="button" class="danger" on:click={clearUserStats}
				>{config.lang.statsDialogClearUserStats}</button
			>
		</form>
	</div>

	<footer>
		<button on:click={cancel}>{config.lang.back}</button>
	</footer>
</div>

<style>
	header {
		margin-top: 1rem;
		margin-bottom: 1.8rem;
	}

	h1 {
		margin: 0px auto;
		font-size: 1.8rem;
		font-weight: bold;
		text-align: center;
		color: #353535;
		font-family: var(--font-title);
	}

	.grid-container {
		width: fit-content;
		margin: 0px auto;
		font-family: var(--font-humanist);
		padding: 0rem 1rem 1rem;
	}
	.grid,
	.actions {
		box-sizing: border-box;
		border: 1px solid #b2b8be;
		border-radius: 0.4rem;
		background-color: #f9f9f9;
		box-shadow: 0px 0px 3px #50505020;
		padding: 1rem 2rem;
		width: 100%;
		margin: 1rem auto;
	}

	.grid {
		display: grid;
		/* grid-template-columns: min-content auto; */
		grid-template-columns: auto auto;
		column-gap: 3rem;

		row-gap: 1.3rem;
		/* width: min-content; */
		white-space: nowrap;
	}

	.actions {
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

	footer {
		margin: 2.5rem 1rem 1rem;
		text-align: right;
	}
</style>
