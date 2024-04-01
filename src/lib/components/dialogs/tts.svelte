<script lang="ts">
	import { onMount } from 'svelte';

	import Spinner from '../imgs/spinner.svelte';

	import { defaultTtsLangs } from '$lib/data/locales';
	import type { Config } from '$lib/config';
	import {
		loadVoiceLangMap,
		displayVoice,
		getLangFromVoice,
		Audio,
		pitchClamp,
		rateClamp,
		volumeClamp
	} from '$lib/audio';

	// Mozilla SpeechSynthesis Demo
	// https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/

	// Chromium
	// chromium-browser --enable-speech-dispatcher
	// https://stackoverflow.com/questions/44013933/how-to-use-web-speech-api-at-chromium

	export let config: Config;
	export let text: string = config.lang.ttsExampleText;

	export let db: IDBDatabase;
	db; // silence svelte(unused-export-let) warning

	let pitch: number = config.tts !== undefined ? config.tts.pitch : 1;
	let rate: number = config.tts !== undefined ? config.tts.rate : 1;
	let volume: number = config.tts !== undefined ? config.tts.volume : 1;
	let queueSize: number = config.tts !== undefined ? config.tts.queueSize : 1;
	let mute: boolean = config.tts !== undefined ? config.tts.mute : true;
	let langs: Map<string, SpeechSynthesisVoice[]> = new Map();
	let voices: SpeechSynthesisVoice[] | undefined = undefined;
	let chosenLang: string | undefined = undefined;
	let chosenVoice: string | undefined = undefined;
	let voice: SpeechSynthesisVoice | undefined = undefined;
	let langSelector: HTMLSelectElement;
	let voiceSelector: HTMLSelectElement;
	let enabled = !mute;
	let voicesLoaded = false;
	let voicesTimeout = false;
	$: mute = !enabled;

	voiceListLoaded(); // this initial load will not work for chrome (see onMount)

	onMount(() => {
		speechSynthesis.cancel();

		// Chrome browsers are weird.  You cannot convince me otherwise.
		speechSynthesis.addEventListener('voiceschanged', voiceListLoaded);

		setTimeout(() => {
			if (!voicesLoaded) voicesTimeout = true;
		}, 10000);
	});

	$: {
		mute;
		pitch;
		rate;
		volume;
		text;
		speechSynthesis.cancel();
	}

	export function getData(): Audio | undefined {
		return voice ? new Audio(voice, rate, pitch, volume, mute, queueSize) : undefined;
	}

	function setChosenLang(choice: string) {
		chosenLang = getLangFromVoice(choice);
		voices = langs.get(chosenLang);
	}

	function setVoice(v: SpeechSynthesisVoice) {
		voice = v;
		chosenVoice = v.name;
	}

	function useFirstVoice() {
		if (voices === undefined || voices.length === 0) return;
		chosenVoice = voices[0].name;
		voice = voices[0];
	}

	function useFirstLang() {
		const first: string | undefined = langs.keys().next().value;
		if (first) {
			setChosenLang(first);
		}
	}

	function findVoiceAndSet(s: string): boolean {
		const v = voices?.find((v) => v.name === s);
		if (v) {
			setVoice(v);
			return true;
		}
		return false;
	}

	function matchLang(arr: string[]) {
		let choice: string | undefined;

		for (choice of arr) {
			const c = getLangFromVoice(choice);
			const a = langs.get(c);
			if (a === undefined) continue;

			setChosenLang(c);
			if (!findVoiceAndSet(choice)) useFirstVoice();
			break;
		}
	}

	function voiceListLoaded() {
		if (langs.size !== 0) return;
		langs = loadVoiceLangMap();
		if (langs.size === 0) return;
		voicesLoaded = true;

		if (config.tts !== undefined && config.tts.voice.name !== '') {
			setChosenLang(config.tts.voice.name);
			setVoice(config.tts.voice);
			return;
		}

		matchLang(defaultTtsLangs(config.lang.lang));
		if (chosenLang !== undefined) return;

		useFirstLang();
		useFirstVoice();
	}

	function play() {
		if (voice === undefined) return;
		const utter = new SpeechSynthesisUtterance(text);
		utter.voice = voice;
		utter.rate = rate;
		utter.pitch = pitch;
		speechSynthesis.speak(utter);
	}

	function langChange(_: Event) {
		speechSynthesis.cancel();
		if (chosenLang === langSelector.value) return;

		setChosenLang(langSelector.value);
		useFirstVoice();
	}

	function voiceChange(_: Event) {
		speechSynthesis.cancel();
		if (chosenVoice === voiceSelector.value) return;

		findVoiceAndSet(voiceSelector.value);
	}
</script>

{#if !voicesLoaded || langs.size === 0}
	{#if !voicesTimeout}
		<div class="loading">
			<p>{config.lang.loading}</p>
			<Spinner />
		</div>
	{:else}
		<div>{@html config.lang.ttsNotEnabled}</div>
	{/if}
{:else}
	<fieldset class:mute-group={mute} disabled={mute}>
		<legend>
			<input id="muted" type="checkbox" bind:checked={enabled} />
			<label for="muted">{config.lang.enable}</label>
		</legend>

		<div class="dialog-grid">
			<label for="lang" class:disabled={mute}>{config.lang.ttsLanguageLabel}</label>
			<select id="lang" bind:this={langSelector} on:change={langChange} disabled={mute}>
				{#each langs.keys() as l}
					<option selected={chosenLang === l} value={l}>{l}</option>
				{/each}
			</select>

			{#if chosenLang !== undefined && voices !== undefined}
				<label for="voice" class:disabled={mute}>{config.lang.ttsVoiceLabel}</label>
				<select id="voice" bind:this={voiceSelector} on:change={voiceChange} disabled={mute}>
					{#each voices as v}
						<option value={v.name} selected={chosenVoice == v.name}>{displayVoice(v.name, chosenLang)}</option>
					{/each}
				</select>
			{/if}

			<label for="pitch" class:disabled={mute}>{config.lang.ttsPitchLabel}</label>
			<div class="input-cell">
				<input
					type="range"
					min={pitchClamp[0]}
					max={pitchClamp[1]}
					bind:value={pitch}
					step="0.1"
					id="pitch"
					disabled={mute}
				/>
				<div class:disabled={mute}>{pitch.toFixed(1)}</div>
			</div>

			<label for="rate" class:disabled={mute}>{config.lang.ttsRateLabel}</label>
			<div class="input-cell">
				<input
					type="range"
					min={rateClamp[0]}
					max={rateClamp[1]}
					bind:value={rate}
					step="0.1"
					id="rate"
					disabled={mute}
				/>
				<div class:disabled={mute}>{rate.toFixed(1)}</div>
			</div>

			<label for="volume" class:disabled={mute}>{config.lang.ttsVolumeLabel}</label>
			<div class="input-cell">
				<input
					type="range"
					min={volumeClamp[0]}
					max={volumeClamp[1]}
					bind:value={volume}
					step="0.01"
					id="volume"
					disabled={mute}
				/>
				<div class:disabled={mute}>{volume.toFixed(2)}</div>
			</div>

			<label for="text" class:disabled={mute}>{config.lang.ttsTextLabel}</label>
			<input id="text" bind:value={text} disabled={mute} />
			<div class="btn-cont">
				<button class="play" type="button" on:click={play} disabled={mute}>{config.lang.ttsPreview}</button>
			</div>
		</div>
	</fieldset>
{/if}

<style>
	.mute-group {
		background-color: #f9f9f9;
	}

	.dialog-grid {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 2rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		width: min-content;
	}

	.input-cell {
		display: flex;
		align-content: baseline;
		align-items: center;
	}

	.input-cell input {
		margin-right: 1rem;
	}

	.input-cell div {
		background-color: #e4e5e9;
		border-radius: 0.2rem;
		padding: 0.3rem 0.3rem;
		width: 4ch;
		text-align: center;
		font-family: var(--font-sans-serif);
		font-size: 95%;
	}

	.input-cell div.disabled {
		background-color: #eeeeee;
	}

	.btn-cont {
		grid-column: span 2;
		text-align: center;
	}

	.loading {
		text-align: center;
	}
	:global(.loading svg) {
		height: 50px;
		width: 50px;
	}
</style>
