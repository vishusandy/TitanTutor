<script lang="ts">
	import '../styles/global.scss';
	import type { PageData } from './$types';
	import { createVoiceDialog } from '$lib/dialog';
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
</script>

<nav>
	<ul>
		<li>
			<button type="button" on:click={showAudioDialog}>Audio</button>
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

	nav button {
		border: 0px;
		background-color: transparent;
		font-size: 1rem;
		padding: 0px;
		margin: 0.2rem 0.6rem;
	}

	nav button:hover {
		color: #333;
		text-decoration: underline;
	}

	nav button:active {
		color: #555;
	}
</style>
