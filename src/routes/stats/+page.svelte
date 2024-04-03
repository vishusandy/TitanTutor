<script lang="ts">
	import '$lib/../styles/global.scss';
	import '$lib/../styles/manage.scss';

	import type { PageData } from '../$types';

	import { formatDuration } from '$lib/util/lang';
	import { home } from '$lib/util/nav';
	import { loadUserConfig } from '$lib/config';
	import { getPluralStrs } from '$lib/util/lang';

	export let data: PageData;
	let db = data.db;
	let config = data.config;

	let stats = config.userStats;
	let grossWpm: string = '';
	let netWpm: string = '';
	let accuracy: string = '';
	let trackStats: boolean = config.logStats;
	let trackStatsCheckbox: HTMLInputElement;
	let plurals = getPluralStrs(config.lang);

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

	async function clearUserStats() {
		if (!window.confirm(config.lang.statsResetPrompt)) {
			return;
		}

		const c = await loadUserConfig(db);
		c.userStats.reset();
		c.saveUserConfig(db);
		config = c;
		stats = c.userStats;
		calc();
	}

	async function changeTrackStats() {
		trackStats = trackStatsCheckbox.checked;
		const c = await loadUserConfig(db);
		c.logStats = trackStats;
		config = c;
		c.saveUserConfig(db);
	}

	function cancel() {
		home();
	}
</script>

<div class="manage">
	<header>
		<h1>{config.lang.statsDialogUserTitle}</h1>
	</header>
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
		<div>{formatDuration(plurals, stats.duration)}</div>

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

	<form>
		<div class="actions">
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
			<button type="button" class="danger" on:click={clearUserStats}>{config.lang.statsDialogClearUserStats}</button>
		</div>
	</form>

	<footer>
		<button on:click={cancel}>{config.lang.back}</button>
	</footer>
</div>

<style>
	.grid {
		grid-template-columns: max-content max-content;
		white-space: nowrap;
	}

	.actions {
		flex-direction: column;
		align-items: center;
	}

	.track-stats-container {
		margin-bottom: 0.5rem;
	}

	#log-stats {
		margin-right: 0.4rem;
	}
</style>