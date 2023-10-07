<script lang="ts">
	// Mozilla SpeechSynthesis Demo
	// https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/

	// Chromium
	// chromium-browser --enable-speech-dispatcher
	// https://stackoverflow.com/questions/44013933/how-to-use-web-speech-api-at-chromium

	import { loadVoiceLangMap, displayVoice, getLangFromVoice } from '$lib/audio';
	import { getDefaultTtsLangsFromLocale } from '$lib/locales';
	import { onMount } from 'svelte';
	import { Audio, pitchClamp, rateClamp, volumeClamp } from '$lib/audio';
	import type { Config } from '$lib/config';

	export let config: Config;

	export let text: string = config.lang.ttsExampleText;

	let pitch: number = config.tts !== undefined ? config.tts.pitch : 1;
	let rate: number = config.tts !== undefined ? config.tts.rate : 1;
	let volume: number = config.tts !== undefined ? config.tts.volume : 1;
	let mute: boolean = config.tts !== undefined ? config.tts.mute : true;
	let queueSize: number = config.tts !== undefined ? config.tts.queueSize : 1;

	let langs: Map<string, SpeechSynthesisVoice[]> = new Map();
	let voices: SpeechSynthesisVoice[] | undefined = undefined;
	let chosenLang: string | undefined = undefined;
	let chosenVoice: string | undefined = undefined;
	let voice: SpeechSynthesisVoice | undefined = undefined;

	let langSelector: HTMLSelectElement;
	let voiceSelector: HTMLSelectElement;

	voiceListLoaded(); // this initial load will not work for chrome (see onMount)

	onMount(() => {
		// Chrome browsers are weird.  You cannot convince me otherwise.
		speechSynthesis.addEventListener('voiceschanged', voiceListLoaded);
	});

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

		if (config.tts !== undefined && config.tts.voice.name !== '') {
			setChosenLang(config.tts.voice.name);
			setVoice(config.tts.voice);
			return;
		}

		matchLang(getDefaultTtsLangsFromLocale(config.lang.lang));
		if (chosenLang !== undefined) return;

		console.log('use first fallback');
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
		if (chosenLang === langSelector.value) return;

		setChosenLang(langSelector.value);
		useFirstVoice();
	}

	function voiceChange(_: Event) {
		if (chosenVoice === voiceSelector.value) return;

		findVoiceAndSet(voiceSelector.value);
	}
</script>

{#if langs.size === 0}
	<div>{@html config.lang.ttsNotEnabled}</div>
{:else}
	<form>
		<!-- <div class="mute"> -->
		<fieldset class:mute-group={mute}>
			<legend>
				<input id="muted" type="checkbox" bind:checked={mute} />
				<label for="muted">{config.lang.ttsMuteLabel}</label>
			</legend>
			<!-- </div> -->

			<div class="grid">
				<label for="lang">{config.lang.ttsLanguageLabel}</label>
				<select id="lang" bind:this={langSelector} on:change={langChange} disabled={mute}>
					{#each langs.keys() as l}
						<option selected={chosenLang === l} value={l}>{l}</option>
					{/each}
				</select>

				{#if chosenLang !== undefined && voices !== undefined}
					<label for="voice">{config.lang.ttsVoiceLabel}</label>
					<select id="voice" bind:this={voiceSelector} on:change={voiceChange} disabled={mute}>
						{#each voices as v}
							<option value={v.name} selected={chosenVoice == v.name}
								>{displayVoice(v.name, chosenLang)}</option
							>
						{/each}
					</select>
				{/if}

				<label for="pitch">{config.lang.ttsPitchLabel}</label>
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
					<span>{pitch.toFixed(1)}</span>
				</div>

				<label for="rate">{config.lang.ttsRateLabel}</label>
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
					<span>{rate.toFixed(1)}</span>
				</div>

				<label for="volume">{config.lang.ttsVolumeLabel}</label>
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
					<span>{volume.toFixed(2)}</span>
				</div>

				<label for="text">{config.lang.ttsTextLabel}</label>
				<input id="text" bind:value={text} disabled={mute} />
				<div class="btn-cont">
					<button class="play" type="button" on:click={play} disabled={mute}
						>{config.lang.ttsPreview}</button
					>
				</div>
			</div>
		</fieldset>
	</form>
{/if}

<style>
	fieldset {
		border-radius: 0.4rem;
	}

	legend label {
		font-size: 1.1rem;
	}

	.mute-group {
		background-color: #f9f9f9;
	}

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
