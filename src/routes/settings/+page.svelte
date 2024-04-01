<script lang="ts">
	import '$lib/../styles/global.scss';
	import '$lib/../styles/manage.scss';

	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import { home } from '$lib/util/nav';
	import { Config, defaultConfig } from '$lib/config';
	import { Language } from '$lib/data/language';
	import { Remap } from '$lib/data/remap';
	import { keyboardRemappings } from '$lib/conf/kbmaps';
	import { defaultTtsLangs } from '$lib/data/locales';
	import { languageList } from '$lib/conf/locales';
	import OptionalNumber from '$lib/components/dialogs/form_inputs/optional_number.svelte';
	import { CheckMode } from '$lib/types/types';
	import { clearAll } from '$lib/db';
	import { showVoiceDialog } from '$lib/util/dialog';

	export let data: PageData;
	let db = data.db;
	let config = data.config;

	onMount(() => {
		document.documentElement.lang = config.lang.lang;
		document.documentElement.dir = config.lang.textDirection;
	});

	let checkMode: CheckMode = config.checkMode;
	let backspace: boolean = config.backspace;
	let wordBatchSize: number = config.wordBatchSize;
	let minQueue: number = config.minQueue;
	let logStats: boolean = config.logStats;
	let remap: Remap = config.remap;
	let lang: Language = config.lang;
	let spaceOptional: boolean = config.spaceOptional;
	let random: boolean = config.random;
	let untilFn: () => number | null;
	let adaptive: boolean = config.adaptive;
	let caseSensitive: boolean = config.caseSensitive;
	let stop: string = config.shortcuts.stop;
	let pause: string = config.shortcuts.pause;

	let selectedKbMapping: string = config.remap.getId();
	let selectedLang: string = config.lang.lang;
	let selectedCheckMode: string = config.checkMode.toString();

	$: checkMode = Number.parseInt(selectedCheckMode);

	function langChanged(_: Event) {
		Language.load(selectedLang).then((l) => (lang = l));
	}

	function remapChanged(_: Event) {
		Remap.load(selectedKbMapping).then((r) => (remap = r));
	}

	async function clearData(e: Event) {
		if (window.confirm(config.lang.actionClearDataPrompt)) {
			clearAll(db);
			config = await defaultConfig();
		}
	}

	async function showAudioDialog(_: Event) {
		showVoiceDialog(config, db).then((audio?) => {
			if (audio !== undefined) {
				config.tts = audio;
			}
		});
	}

	function cancel() {
		home();
	}

	function save() {
		const newConfig = new Config({
			user: config.user,
			lastLesson: config.lastLesson,
			tts: config.tts,
			shortcuts: { stop, pause },
			logStats,
			caseSensitive,
			audioDefaults: defaultTtsLangs(lang.lang),
			remap,
			lang,
			userStats: config.userStats,
			nextCustomId: config.nextCustomId,
			spaceOptional,
			random,
			until: untilFn(),
			minQueue,
			wordBatchSize,
			checkMode,
			backspace,
			adaptive
		});

		newConfig.saveUserConfig(db);

		home();
	}
</script>

<svelte:head>
	<title>{config.lang.settingsTitle}</title>
</svelte:head>

<div class="manage">
	<header>
		<h1>{config.lang.configDialogTitile}</h1>
	</header>
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

		<OptionalNumber
			bind:getData={untilFn}
			{config}
			label={config.lang.configUntil}
			initialState={config.until}
			id="until"
			defaultValue={100}
			nullLabel={config.lang.infinite}
		/>

		<div class="merge">
			<input id="adaptive" type="checkbox" bind:checked={adaptive} />
			<label for="adaptive">{config.lang.configAdaptive}</label>
		</div>

		<div class="merge">
			<input id="random" type="checkbox" bind:checked={random} />
			<label for="random">{config.lang.configRandom}</label>
		</div>

		<div class="merge">
			<input id="spaceOptional" type="checkbox" bind:checked={spaceOptional} />
			<label for="spaceOptional">{config.lang.configSpaceOptional}</label>
			<div class="note">{config.lang.configCharModeOnly}</div>
		</div>

		<div class="merge">
			<input id="backspace" type="checkbox" bind:checked={backspace} />
			<label for="backspace">{config.lang.configAcceptBackspace}</label>
		</div>

		<div class="merge">
			<input id="caseSensitive" type="checkbox" bind:checked={caseSensitive} />
			<label for="caseSensitive">{config.lang.configCaseSensitive}</label>
		</div>

		<label for="wordBatchSize">{config.lang.configWordBatchSize}</label>
		<input id="wordBatchSize" type="number" min="1" max="100" step="1" bind:value={wordBatchSize} />

		<label for="minQueue">{config.lang.configMinQueue}</label>
		<input id="minQueue" type="number" min="1" max="100" step="1" bind:value={minQueue} />

		<div class="merge">
			<input id="logStats" type="checkbox" bind:checked={logStats} />
			<label for="logStats">{config.lang.configLogLessonStats}</label>
		</div>
	</div>

	<div class="actions">
		<button type="button" on:click={showAudioDialog}>{config.lang.openTtsDialog}</button>
		<button class="danger" on:click={clearData}>{config.lang.actionClearData}</button>
	</div>

	<footer>
		<button type="submit" on:click={save}>{config.lang.save}</button>
		<button on:click={cancel}>{config.lang.cancel}</button>
	</footer>
</div>

<style>
	.grid {
		grid-template-columns: max-content max-content;
	}

	.grid > select,
	.grid > input {
		grid-column-start: 2;
		grid-column-end: 3;
	}

	.grid > .merge {
		grid-column: 1/3;
		display: flex;
		column-gap: 0.4rem;
	}

	:global(.manage .check-value) {
		min-height: 2rem;
		display: flex;
		align-content: center;
	}
	:global(.manage .check-value) {
		grid-column: 2/3;
	}
	:global(.manage .check-value input[type='checkbox']) {
		align-self: center;
	}

	:global(.manage .grid > label) {
		align-self: start;
	}
	:global(.manage .grid select) {
		height: min-content;
	}

	:global(.manage > .grid input) {
		height: min-content;
	}

	.note {
		color: #9d9d9d;
	}
	:global(.manage label) {
		font-size: 105%;
	}
</style>
