<script lang="ts">
	import '$lib/../styles/global.scss';
	import '$lib/../styles/manage.scss';

	import type { PageData } from '../$types';

	import { formatDuration } from '$lib/util/lang';
	import { home } from '$lib/util/nav';
	import { loadUserConfig } from '$lib/config';
	import { getPluralStrs } from '$lib/util/lang';
	import { formatNaN } from '$lib/util/util';

	export let data: PageData;
	let db = data.db;
	let config = data.config;

	let stats = config.userStats;
	let grossWpm: string = '';
	let netWpm: string = '';
	let accuracy: string = '';
	let plurals = getPluralStrs(config.lang);

	export function getData(): boolean {
		return true;
	}

	function calc() {
		grossWpm = formatNaN(config.lang, stats.getGrossWpm(), { style: 'decimal', maximumFractionDigits: 2 });
		netWpm = formatNaN(config.lang, stats.getNetWpm(), { style: 'decimal', maximumFractionDigits: 2 });
		accuracy = formatNaN(config.lang, stats.getAccuracy(), { style: 'percent' });
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
			<button type="button" class="danger" on:click={clearUserStats}>{config.lang.resetStats}</button>
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
	}
</style>
