<script lang="ts">
	import '$lib/../styles/typing.scss';
	import '$lib/../styles/global.scss';

	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { SessionStats } from '$lib/stats';
	import { showStatsDialog, showVoiceDialog } from '$lib/dialog';
	import type { Audio } from '$lib/audio';

	export let data: PageData;

	let config = data.config;
	let lesson = data.lesson;
	let sessionStats = new SessionStats(config.checkMode);

	async function showAudioDialog(e: MouseEvent) {
		showVoiceDialog(data.config).then((audio?: Audio) => {
			if (audio !== undefined) {
				data.config.tts = audio;
				data.config.saveUserConfig();
			}
		});
	}

	async function showUserStatsDialog() {
		showStatsDialog(data.config.lang.statsDialogUserTitle, data.config, data.config.userStats);
	}
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<nav>
	<ul>
		<li>
			<button class="link" type="button" on:click={showAudioDialog}
				>{data.config.lang.openTtsDialog}</button
			>
		</li>
		<li>
			<button class="link" type="button" on:click={showUserStatsDialog}
				>{data.config.lang.openUserStatsDialog}</button
			>
		</li>
	</ul>
</nav>

<Typing {config} {lesson} {sessionStats} />

<style>
	ul {
		margin: 0px;
		padding: 0px;
		display: flex;
		justify-content: center;
	}

	li {
		list-style: none;
	}
</style>
