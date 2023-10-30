<script lang="ts">
	import { CheckMode, Config } from '$lib/config';
	import { Language } from '$lib/language';
	import { Remap, keyboardRemappings } from '$lib/remap';
	import { defaultTtsLangs, languageList } from '$lib/locales';
	import type { ChangeEventHandler } from 'svelte/elements';

	export let config: Config;

	let checkMode: CheckMode = config.checkMode;
	let backspace: boolean = config.backspace;
	let wordBatchSize: number = config.wordBatchSize;
	let minQueue: number = config.minQueue;
	let stop: string = config.stop;
	let pause: string = config.pause;
	let logStats: boolean = config.logStats;
	let remap: Remap = config.remap;
	let lang: Language = config.lang;
	let spaceOptional: boolean = config.spaceOptional;
	let random: boolean = config.random;
	let until: number | null = config.until;

	let selectedKbMapping: string = config.remap.getId();
	let selectedLang: string = config.lang.lang;
	let selectedCheckMode: string = config.checkMode.toString();

	$: checkMode = Number.parseInt(selectedCheckMode);

	export function getData(): Config {
		return new Config({
			version: 1,
			tts: config.tts,
			stop,
			pause,
			logStats,
			audioDefaults: defaultTtsLangs(lang.lang),
			remap,
			lang,
			userStats: config.userStats,
			spaceOptional,
			random,
			until,
			minQueue,
			wordBatchSize,
			checkMode,
			backspace
		});
	}

	function langChanged(_: Event) {
		Language.load(selectedKbMapping).then((l) => (lang = l));
	}

	function remapChanged(_: Event) {
		Remap.load(selectedKbMapping).then((r) => (remap = r));
	}
</script>

<div class="grid">
	<label for="language">{config.lang.configLanguage}</label>
	<select id="language" bind:value={selectedLang} on:change={langChanged}>
		{#each languageList as item (item.path)}
			<option value={item.path}>{item.name}</option>
		{/each}
	</select>

	<label for="remap">{config.lang.configRemap}</label>
	<select id="remap" bind:value={selectedKbMapping} on:change={remapChanged}>
		{#each keyboardRemappings as mapping (mapping.id)}
			{#if mapping.id == 'no_map'}
				<option value={mapping.id}>{config.lang.none}</option>
			{:else}
				<option value={mapping.id}>{mapping.name}</option>
			{/if}
		{/each}
	</select>

	<label for="checkMode">{config.lang.configCheckMode}</label>
	<select id="checkMode" bind:value={selectedCheckMode}>
		<option value={CheckMode.WordRepeat.toString()}>{config.lang.configCheckModeWords}</option>
		<option value={CheckMode.Char.toString()}>{config.lang.configCheckModeChars}</option>
	</select>

	<label for="wordBatchSize">{config.lang.configWordBatchSize}</label>
	<input id="wordBatchSize" type="number" min="1" max="100" step="1" bind:value={wordBatchSize} />

	<label for="minQueue">{config.lang.configMinQueue}</label>
	<input id="minQueue" type="number" min="1" max="100" step="1" bind:value={minQueue} />

	<label for="backspace">{config.lang.configAcceptBackspace}</label>
	<input id="backspace" type="checkbox" bind:checked={backspace} />

	<label for="logStats">{config.lang.configLogLessonStats}</label>
	<input id="logStats" type="checkbox" bind:checked={logStats} />
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 2rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		min-width: 40ch;
		width: min-content;
	}
</style>
