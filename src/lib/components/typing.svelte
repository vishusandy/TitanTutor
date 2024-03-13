<script lang="ts">
	import { onMount, tick } from 'svelte';

	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';
	import Timer from './timer.svelte';
	import Series from './series.svelte';
	import Stop from './imgs/stop.svelte';
	import Stats from './imgs/stats.svelte';
	import Cog from './imgs/cog.svelte';

	import { addMissedSpace, addSpace } from '$lib/util/dom';
	import type { Config } from '$lib/config';
	import { LessonStats } from '$lib/stats';
	import { WordState } from '$lib/word_state';
	import { Queue } from '$lib/queue';
	import { Action, CheckMode } from '$lib/types/types';
	import type { Audio } from '$lib/audio';
	import { Lesson } from '$lib/lessons/lesson';
	import type { LessonTypingConfig } from '$lib/types/lessons';
	import {
		showConfigDialog,
		showLessonConfigDialog,
		showStatsConfirmDialog,
		showStatsDialog,
		showVoiceDialog
	} from '$lib/util/dialog';
	import { lessonInSeries, lessonPlans } from '$lib/conf/lesson_plans';
	import type { LessonChange } from '$lib/types/events';
	import { get } from '$lib/db';

	export let db: IDBDatabase;
	export let originalConfig: Config;
	export let lesson: Lesson;
	export let lessonOpts: Partial<LessonTypingConfig>;
	export let lessonStats: LessonStats;

	let config = originalConfig.mergeLessonOptions(lessonOpts).mergeAvailable(lesson.overrides());
	let queue = new Queue(config, lesson, lessonOpts, lessonStats);
	let seriesId: string | undefined = lessonInSeries.get(lesson.baseLesson().id);
	let series = seriesId !== undefined ? lessonPlans.get(seriesId) : undefined;
	let seriesIdx =
		series !== undefined ? series.lessons.findIndex((v) => v == lesson.baseLesson().id) : 0;

	let started: boolean = false;
	let paused: boolean = true;
	let finished: boolean = false;

	let activeWord: HTMLElement | undefined;
	let textbox: HTMLInputElement | undefined;
	let historyNode: HTMLElement;

	$: {
		queue.word.word; // trigger scroll() when word changes
		scroll();
	}

	onMount(async () => {
		document.addEventListener('click', handleBodyClick);
		document.addEventListener('touchstart', handleBodyClick);

		if (textbox) {
			started = false;
			await tick();
			textbox.focus();
		}

		Lesson.saveLast(lesson, originalConfig, db);
	});

	function handleBodyClick(e: Event) {
		textbox?.focus();
	}

	async function startInput(e: Event) {
		if ('key' in e) {
			if (e.key === 'Tab') return;
			if (e.key === config.shortcuts.pause) {
				e.preventDefault();
				return;
			}
		}

		started = true;
		unpause();
	}

	async function unpause(e: KeyboardEvent | undefined = undefined) {
		if (textbox === undefined) return;
		paused = false;
		lessonStats.resume();
		await tick();
		textbox.focus();

		if (e !== undefined) {
			handleAction(lesson.handleKeydown(e, config, queue.word, lessonStats));
		}
	}

	function pause(_: Event) {
		if (textbox === undefined) return;
		paused = true;
		if (queue.word.atEnd() && queue.word.word === queue.word.input) {
			handleAction(Action.NextWord & Action.Refresh);
		}
		lessonStats.pause();
	}

	async function lessonCompleted() {
		endLesson();
	}

	function confirmEndLesson() {
		if (window.confirm(config.lang.stopMsg)) {
			endLesson();
		}
	}

	async function reset(lessonOpts?: Partial<LessonTypingConfig>) {
		const id = lesson.baseLesson().id;
		// if (lessonOpts === undefined) lessonOpts = await Lesson.getLessonOptions(id, db);
		if (lessonOpts === undefined) lessonOpts = {};

		lesson = await Lesson.load(id, originalConfig, db);
		queue = new Queue(originalConfig, lesson, lessonOpts, lessonStats);
		started = false;
		paused = true;
		finished = false;
		lessonStats = new LessonStats(id, config.checkMode);

		let child;
		while ((child = historyNode.firstChild)) historyNode.removeChild(child);
	}

	async function endLesson() {
		if (lessonStats.chars !== 0) {
			paused = true;
			lessonStats.pause();
			lessonStats = lessonStats;
			if (originalConfig.logStats) {
				await showStatsConfirmDialog(originalConfig, db, lessonStats).then(
					(v: boolean | undefined) => {
						if (v === true) {
							originalConfig.userStats.add(lessonStats);
							originalConfig.saveUserConfig(db);
						}
					}
				);
			}
		}
		finished = true;
		return;
	}

	async function changeLesson(e: LessonChange) {
		const id = e.to;
		console.log(`setting lesson id to ${id}`);
		lesson = await Lesson.load(id, originalConfig, db);
		Lesson.saveLast(lesson, originalConfig, db);
		queue = new Queue(originalConfig, lesson, lessonOpts, lessonStats);
		seriesId = lessonInSeries.get(lesson.baseLesson().id);
		series = seriesId !== undefined ? lessonPlans.get(seriesId) : undefined;
		seriesIdx =
			series !== undefined ? series.lessons.findIndex((v) => v == lesson.baseLesson().id) : 0;

		started = false;
		paused = true;
		finished = false;
		lessonStats = new LessonStats(id, config.checkMode);
	}

	async function shortcuts(e: KeyboardEvent) {
		if (e.key === config.shortcuts.pause || e.key === 'Escape') {
			if (paused) {
				unpause();
				textbox?.focus();
			} else {
				pause(e);
			}
			if (!started) started = true;
			e.preventDefault();
		} else if (e.key === config.shortcuts.stop && started) {
			e.preventDefault();
			pause(e);
			confirmEndLesson();
		}
	}

	function handleClick(_: Event) {
		textbox?.focus();
	}

	function handleBeforeInput(e: InputEvent) {
		handleAction(lesson.handleInput(e, config, queue.word, lessonStats));
	}

	function handleKeydown(e: KeyboardEvent) {
		handleAction(lesson.handleKeydown(e, config, queue.word, lessonStats));
	}

	function handleAction<T = undefined>(action: Action, ctx: T | undefined = undefined) {
		if (action === 0) return;

		if (action & Action.MissedSpace) {
			handleAction(Action.NextWord & Action.Refresh, true);
			addMissedSpace(originalConfig.lang, historyNode);
		}

		if (action & Action.LessonCompleted) {
			if (!queue.word.empty()) addToHistory(queue.word);
			queue.word = new WordState('');
			lessonCompleted();
		}

		if (action & Action.NextWord) {
			const n = queue.nextWord();
			if (!Array.isArray(n)) {
				if ((n & Action.NextWord) === 0) handleAction(n);
				return;
			}
			if (n[0] !== undefined) {
				addToHistory(n[0]);
				if (ctx === undefined) addSpace(originalConfig.lang, historyNode);
			}
		}

		if (action & Action.Refresh) {
			queue = queue;
			return;
		}
	}

	async function scroll() {
		await tick();
		if (activeWord) {
			activeWord.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function addToHistory(w: WordState) {
		new Word({
			target: historyNode,
			props: {
				word: w.wordChars,
				state: w.state
			}
		});
	}

	async function showSessionStatsDialog() {
		showStatsDialog(originalConfig.lang.statsDialogSessionTitle, originalConfig, db, lessonStats);
	}

	async function showUserStatsDialog() {
		showStatsDialog(
			originalConfig.lang.statsDialogUserTitle,
			originalConfig,
			db,
			originalConfig.userStats
		);
	}

	async function showAudioDialog(_: Event) {
		showVoiceDialog(originalConfig, db).then((audio?: Audio) => {
			if (audio !== undefined) {
				originalConfig.tts = audio;
				originalConfig.saveUserConfig(db);
				queue.playCurrentWord();
			}
		});
	}

	async function showLessonOptions(): Promise<void> {
		const data = await showLessonConfigDialog(originalConfig, db, lesson, lessonOpts);
		if (data !== undefined) {
			let lessonOptions: Partial<LessonTypingConfig>;
			[lesson, lessonOptions] = data;
			Lesson.saveLessonOptions(lesson.baseLesson().id, lessonOptions, db);
			reset(lessonOptions);
		}
	}

	async function showUserConfig(_: Event) {
		showConfigDialog(originalConfig, db).then((conf?: Config) => {
			if (conf !== undefined) {
				originalConfig = conf;
				reset();
				originalConfig.saveUserConfig(db);
				reset();
			}
		});
	}
</script>

<svelte:document on:keydown={shortcuts} />
<div class="frame">
	<header class="header">
		<ul>
			<li>
				<button class="link" type="button" on:click={showUserConfig}
					>{originalConfig.lang.openConfigDialog}</button
				>
			</li>
			<li>
				<button class="link" type="button" on:click={showAudioDialog}
					>{originalConfig.lang.openTtsDialog}</button
				>
			</li>
			<li>
				<button class="link" type="button" on:click={showUserStatsDialog}
					>{originalConfig.lang.openUserStatsDialog}</button
				>
			</li>
		</ul>
	</header>

	<section class:paused>
		<h1 class="tutor-title">
			{lesson.baseLesson().getName(originalConfig.lang)}
		</h1>

		<div class="counter" class:active={!paused}>
			{#if !started}
				{originalConfig.lang.notStarted}
			{:else}
				<Timer stats={lessonStats} lang={originalConfig.lang} />
			{/if}
		</div>

		<div class="tutor-bar">
			<div class="tutor-bar-left" />
			<div class="tutor-bar-right">
				{#if config.until !== null}
					<div class="word-progress">{queue.history.length} / {config.until}</div>
				{:else}
					<div class="word-progress">{queue.history.length} / ∞</div>
				{/if}
			</div>
		</div>

		<div
			class="tutor-words"
			class:paused
			class:char-mode={originalConfig.checkMode === CheckMode.Char}
		>
			<span bind:this={historyNode} class="history" /><Word
				bind:span={activeWord}
				word={queue.word.wordChars}
				state={queue.word.state}
				active={true}
			/><span class="spacer" /><span class="queue">
				{#each queue.queue as q}
					<QueuedWord word={q} />{' '}
				{/each}
			</span>
		</div>

		<nav class="tutor-below">
			<div class="tutor-menu">
				<div class="tutor-menu-left">
					{#if series !== undefined}
						<Series
							on:lessonChanged={(e) => changeLesson(e.detail)}
							{series}
							seriesIndex={seriesIdx}
							stopMsg={originalConfig.lang.stopMsg}
							done={finished || !started}
							prevText={originalConfig.lang.seriesPrevLesson}
							nextText={originalConfig.lang.seriesNextLesson}
							lessonSelectText={originalConfig.lang.seriesSelectLesson}
						/>
					{/if}
				</div>
				<div class="tutor-menu-right">
					<button
						type="button"
						class="fade-icon stats-button"
						on:click={showSessionStatsDialog}
						title={originalConfig.lang.openSessionStatsDialog}><Stats /></button
					>
					<button
						type="button"
						class="fade-icon cog-button"
						on:click={showLessonOptions}
						title={originalConfig.lang.openLessonConfigDialog}><Cog /></button
					>

					<button
						type="button"
						class="fade-icon stop-button"
						disabled={!started}
						on:click={confirmEndLesson}
						title={originalConfig.lang.stop}
					>
						<Stop />
					</button>
				</div>
			</div>
		</nav>

		{#if !finished}
			<div class="tutor-bottom">
				{#if paused && !started}
					<input
						class="tutor-input"
						bind:this={textbox}
						placeholder={originalConfig.lang.inputNotStarted}
						on:keydown={startInput}
					/>
				{:else if paused && started}
					<input
						class="tutor-input"
						bind:this={textbox}
						placeholder={originalConfig.lang.inputPaused}
						on:keydown={unpause}
					/>
				{:else}
					<input
						class="tutor-input"
						bind:this={textbox}
						value={queue.word.input}
						on:blur={pause}
						on:beforeinput={handleBeforeInput}
						on:keydown={handleKeydown}
						on:selectstart|preventDefault={() => {}}
						on:mousedown|preventDefault={() => {}}
						on:click|preventDefault={handleClick}
					/>
				{/if}
			</div>
		{:else}
			<div class="finished">
				<button type="button" on:click={() => reset()}>{originalConfig.lang.restartLesson}</button>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.tutor-below {
		width: var(--width);
		max-width: var(--max-width);
		text-align: center;
		margin: 0px auto 2rem;
	}
	.counter {
		font-family: var(--font-sans-serif);
		display: flex;
		width: fit-content;
		margin: 0px auto 1rem;
		transition-property: background-color, color;
		transition-duration: 0.5s;
		transition-timing-function: ease-in-out;
		padding: 0.4rem;
		border-radius: 0.3rem;
	}

	.counter.active {
		color: white;
		background-color: #155b77;
	}

	.tutor-title {
		font-size: 2.5rem;
		text-align: center;
		font-family: var(--font-title);
		font-weight: bold;
		color: #34353a;
		filter: drop-shadow(0px 0px 2px #6a6c7517);
		margin: auto;
	}

	.tutor-words {
		--drop-shadow-color: rgba(206, 74, 12, 0.1);
		--border-color: rgba(206, 74, 12, 0.3);
		box-sizing: border-box;
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
		border-bottom: 0px;
		background: rgba(255, 255, 255, 1);
		font-family: var(--font-monospace);
		font-size: 1.7rem;
		margin: 0px auto;
		padding: 0px 1em;
		width: calc(var(--width) - 1.5rem);
		max-width: calc(var(--max-width) - 1.5rem);
		height: 12em;
		overflow: auto;
		text-align: center;
		scroll-behavior: smooth;
		scroll-snap-type: y mandatory;
		box-shadow: 0px 0px 7px #cfcfcf;
		box-sizing: border-box;
		// filter: drop-shadow(1px 1px 2px var(--drop-shadow-color))
		// 	drop-shadow(2px 2px 4px var(--drop-shadow-color))
		// 	drop-shadow(4px 4px 8px var(--drop-shadow-color));
	}

	.tutor-words.paused {
		// --drop-shadow-color: rgba(36, 58, 92, 0.1);
		// --border-color: rgba(36, 58, 92, 0.4);
		--drop-shadow-color: rgba(36, 58, 92, 0.1);
		--border-color: #83878b;
		background-color: #f9f9f9;
	}

	.tutor-bottom {
		text-align: center;
		width: var(--width);
		max-width: var(--max-width);
		margin: 1.5rem auto;
	}

	.tutor-input {
		box-shadow: none !important;
		font-size: 1.2rem;
		width: 90%;
		max-width: 30ch;
		text-align: center;
		padding: 0.8rem 2rem;
		caret-color: transparent;
		border: 1px solid #243a5c66;
		box-sizing: border-box;
		filter: drop-shadow(0px 0px 3px #51709e70) drop-shadow(0px 0px 5px #e2b08c3d);
		box-sizing: border-box;
		// border: 1px solid #008ff5;
	}
	.tutor-input:focus {
		filter: drop-shadow(0px 0px 1px #51709e70) drop-shadow(0px 0px 5px #f5660096);
	}

	.finished {
		width: 100%;
		max-width: 30ch;
		text-align: center;
		margin: 2rem auto;
	}

	.tutor-input:focus,
	.tutor-input {
		font-size: 1.5rem;
		--drop-shadow-color: rgba(206, 74, 12, 0.1);
		--input-border: rgba(36, 58, 92, 0.4);
	}

	.paused .tutor-input:focus {
		--drop-shadow-color: rgba(129, 47, 15, 0.1);
		--input-border: rgba(36, 58, 92, 0.4);
	}

	.tutor-menu {
		color: rgb(211, 209, 218);
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		background-color: #f0f0f5;
		border: 1px solid #aeb4b9;
		border-radius: 0.7rem;
		padding: 0.5rem 0.3rem;
		box-shadow: 0px 1px 7px #3a3a3a3b;
	}

	.tutor-menu-right {
		font-size: 1.2rem;
		display: flex;
		flex-grow: 1;
		justify-content: right;
	}

	.tutor-bar {
		box-sizing: border-box;
		text-align: right;
		padding: 0px 2em;
		margin: 0px auto;
		width: var(--width);
		max-width: var(--max-width);
		display: flex;
		justify-content: space-between;
	}

	.word-progress {
		align-self: center;
		margin: 0px 1rem;
		font-family: var(--font-monospace);
		color: #686868;
		font-size: 1rem;
		padding: 0.5rem 0.375rem;
		border-radius: 0.375rem;
		// filter: drop-shadow(0px 0px 2px #f37a29a9);
		cursor: default;
	}

	.stop-button:not(.hidden) {
		animation: opacity-fadein 0.5s ease-out 0s 1;
	}

	@keyframes opacity-fadein {
		0% {
			opacity: 0;
		}
	}

	button.fade-icon {
		width: 2.5rem;
		height: 2.5rem;
	}

	:global(.stop-button svg) {
		fill: #f34747;
	}

	:global(.cog-button svg) {
		fill: #9c9191;
	}

	:global(.stats-button svg) {
		--bar-color0: rgb(255, 166, 0);
		--bar-color1: rgb(52, 153, 61);
		--bar-color2: rgb(12, 207, 214);
		--bar-color3: rgb(230, 49, 124);
	}

	// mobile devices
	@media (pointer: coarse) {
		:root {
			--width: 94%;
		}

		.tutor-words {
			padding: 0px 0.2em;
		}

		.tutor-input {
			padding: 0.4rem 0.75rem;
			caret-color: auto;
		}

		.tutor-menu-right {
			justify-content: right;
		}
	}
</style>
