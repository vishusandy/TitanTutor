<script lang="ts">
	import '../styles/global.scss';
	import type { PageData } from './$types';
	import { createStatsDialog, createVoiceDialog } from '$lib/dialog';
	import type { Audio } from '$lib/audio';
	export let data: PageData;

	async function showAudioDialog(e: MouseEvent) {
		createVoiceDialog(data.config).then((audio?: Audio) => {
			if (audio !== undefined) {
				data.config.tts = audio;
				data.config.saveUserConfig();
			}
		});
	}

	async function showUserStatsDialog() {
		createStatsDialog(data.config.lang.statsDialogUserTitle, data.config, data.config.userStats);
	}
</script>

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

<slot />

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
