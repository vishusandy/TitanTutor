<script lang="ts">
	import { Config } from '$lib/config';
	import { Language } from '$lib/data/language';
	import { Remap } from '$lib/data/remap';
	import { keyboardRemappings } from '$lib/conf/kbmaps';
	import { defaultTtsLangs } from '$lib/data/locales';
	import { languageList } from '$lib/conf/locales';
	import OptionalNumber from './form_inputs/optional_number.svelte';
	import { CheckMode } from '$lib/types/types';

	export let config: Config;

	let checkMode: CheckMode = config.checkMode;
	let backspace: boolean = config.backspace;
	let wordBatchSize: number = config.wordBatchSize;
	let minQueue: number = config.minQueue;
	let stop: string = config.shortcuts.stop;
	let pause: string = config.shortcuts.pause;
	let logStats: boolean = config.logStats;
	let remap: Remap = config.remap;
	let lang: Language = config.lang;
	let spaceOptional: boolean = config.spaceOptional;
	let random: boolean = config.random;
	let untilFn: () => number | null;
	let adaptive: boolean = config.adaptive;

	let selectedKbMapping: string = config.remap.getId();
	let selectedLang: string = config.lang.lang;
	let selectedCheckMode: string = config.checkMode.toString();

	$: checkMode = Number.parseInt(selectedCheckMode);

	export function getData(): Config {
		return new Config({
			user: config.user,
			lastLesson: config.lastLesson,
			version: 1,
			tts: config.tts,
			shortcuts: { stop, pause },
			logStats,
			audioDefaults: defaultTtsLangs(lang.lang),
			remap,
			lang,
			userStats: config.userStats,
			spaceOptional,
			random,
			until: untilFn(),
			minQueue,
			wordBatchSize,
			checkMode,
			backspace,
			adaptive
		});
	}

	function langChanged(_: Event) {
		Language.load(selectedLang).then((l) => (lang = l));
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

	<label for="spaceOptional">{config.lang.configSpaceOptional}</label>
	<div>
		<input id="spaceOptional" type="checkbox" bind:checked={spaceOptional} />
		{config.lang.configCharModeOnly}
	</div>

	<label for="adaptive">{config.lang.configAdaptive}</label>
	<input id="adaptive" type="checkbox" bind:checked={adaptive} />

	<label for="random">{config.lang.configRandom}</label>
	<input id="random" type="checkbox" bind:checked={random} />

	<OptionalNumber
		bind:getData={untilFn}
		{config}
		label={config.lang.configUntil}
		initialState={config.until}
		id="until"
		defaultValue={100}
		nullLabel={config.lang.infinite}
	/>
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
