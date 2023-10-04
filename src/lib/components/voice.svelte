<script lang="ts">
	// Mozilla SpeechSynthesis Demo
	// https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/

	// Chromium
	// chromium-browser --enable-speech-dispatcher
	// https://stackoverflow.com/questions/44013933/how-to-use-web-speech-api-at-chromium

	import { getLanguages, displayVoice, getDefaultLang } from '$lib/audio';
	import { onMount } from 'svelte';
	import { Audio } from '$lib/audio';

	export let defaultLangs: string[] = ['English (America)', 'Google US English'];

	export let formData: Audio | undefined = undefined;
	export let text: string = 'Example Text';

	let pitch: number = formData !== undefined ? formData.pitch : 1;
	let rate: number = formData !== undefined ? formData.rate : 1;
	let volume: number = formData !== undefined ? formData.volume : 1;

	let voiceIdx: number = 0;
	let langs: Map<string, SpeechSynthesisVoice[]> = new Map();
	let lang: string | null = null;
	voiceListLoaded(); // this initial load will not work for chrome (see onMount)

	let voiceList: SpeechSynthesisVoice[] | undefined = undefined;
	$: voiceList = lang ? langs.get(lang) : undefined;

	let voice: SpeechSynthesisVoice | undefined = undefined;
	$: voice = voiceList ? voiceList[0] : undefined;

	$: formData = voice ? new Audio(voice, rate, pitch, volume) : undefined;

	onMount(() => {
		// Chrome browsers are weird.  You cannot convince me otherwise.
		speechSynthesis.addEventListener('voiceschanged', voiceListLoaded);
	});

	function voiceListLoaded() {
		if (lang !== null) return;

		langs = getLanguages();
		if (langs.size === 0) return;

		lang = getDefaultLang(defaultLangs, langs);

		if (lang === null) {
			lang = langs.keys().next().value;
		}
	}

	function langChoiceUpdated() {
		let v: SpeechSynthesisVoice[] | undefined;

		if (lang !== null && !(v = langs.get(lang))) {
			voiceIdx = 0;
		}
	}

	function play() {
		if (voice === undefined) return;
		const utter = new SpeechSynthesisUtterance(text);
		utter.voice = voice;
		utter.rate = rate;
		utter.pitch = pitch;
		speechSynthesis.speak(utter);
	}
</script>

<form>
	<div class="grid">
		<label for="lang">Language: </label>
		<select id="lang" bind:value={lang} on:change={langChoiceUpdated}>
			{#each langs.keys() as l, i}
				<option selected={(lang !== undefined && l === lang) || (lang === undefined && i == 0)}
					>{l}</option
				>
			{/each}
		</select>

		{#if lang && voiceList}
			<label for="voice">Voice: </label>
			<select id="voice" bind:value={voiceIdx}>
				{#each voiceList as v, i}
					<option value={i}>{displayVoice(v.name, lang)}</option>
				{/each}
			</select>
		{/if}

		<label for="pitch">Pitch</label>
		<div class="input-cell">
			<input type="range" min="0" max="2" bind:value={pitch} step="0.1" id="pitch" />
			<span>{pitch.toFixed(1)}</span>
		</div>

		<label for="rate">Rate</label>
		<div class="input-cell">
			<input type="range" min="0.5" max="2" bind:value={rate} step="0.1" id="rate" />
			<span>{rate.toFixed(1)}</span>
		</div>

		<label for="volume">Volume</label>
		<div class="input-cell">
			<input type="range" min="0" max="1" bind:value={volume} step="0.01" id="volume" />
			<span>{volume.toFixed(2)}</span>
		</div>

		<label for="text">Text: </label>
		<input id="text" bind:value={text} />
		<div class="btn-cont">
			<button class="play" type="button" on:click={play}>Test</button>
		</div>
	</div>
</form>

<style>
	.grid {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 2rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		width: min-content;
	}

	label {
		align-self: center;
		color: #353535;
		font-style: italic;
		font-weight: 600;
		font-size: 95%;
	}

	.input-cell {
		display: flex;
		align-content: baseline;
	}

	.input-cell input {
		margin-right: 1rem;
	}

	.input-cell span {
		width: 3.5ch;
		text-align: center;
	}

	.btn-cont {
		grid-column: span 2;
		text-align: center;
	}

	.play {
		padding: 0.375rem 0.75rem;
		font-weight: 600;
	}
</style>
