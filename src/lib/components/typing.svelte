<script lang="ts">
	import { onMount, tick } from 'svelte';

	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';

	import { CheckMode, type Config } from '$lib/config';
	import { SessionStats } from '$lib/stats';
	import type { WordState } from '$lib/word_state';
	import { Tutor } from '$lib/tutor';
	import { Action } from '$lib/types';
	import type { Audio } from '$lib/audio';
	import { Lesson, type LessonTypingConfig } from '$lib/lessons/lessons';
	import {
		showConfigDialog,
		showLessonConfigDialog,
		showStatsConfirmDialog,
		showStatsDialog,
		showVoiceDialog
	} from '$lib/dialog';

	export let config: Config;
	export let lesson: Lesson;
	export let sessionStats: SessionStats;

	let tutor = new Tutor(config, lesson, Lesson.getOverrides(lesson.baseLesson().id), sessionStats);

	let started: boolean = false;
	let paused: boolean = true;
	let finished: boolean = false;
	let activeWord: HTMLElement | undefined;
	let textbox: HTMLInputElement | undefined;
	let historyNode: HTMLElement;

	$: {
		tutor.word.word; // trigger scroll() when word changes
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

		Lesson.saveLast(lesson);
	});

	function handleBodyClick(_: Event) {
		textbox?.focus();
	}

	async function startInput(e: Event) {
		if ('key' in e) {
			if (e.key === 'Tab') return;
			if (e.key === config.pause) {
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
		sessionStats.resume();
		await tick();
		textbox.focus();

		if (e !== undefined) {
			handleAction(tutor.handleKeydown(e));
		}
	}

	function pause(_: Event) {
		if (textbox === undefined) return;
		paused = true;
		if (tutor.word.atEnd()) {
			handleAction(Action.NextWord);
		}
		sessionStats.pause();
	}

	async function lessonCompleted() {
		endLesson();
	}

	function confirmEndLesson() {
		if (window.confirm(config.lang.stopMsg)) {
			endLesson();
		}
	}

	async function reset(overrides?: Partial<LessonTypingConfig>) {
		const id = lesson.baseLesson().id;
		if (overrides === undefined) overrides = Lesson.getOverrides(id);

		lesson = await Lesson.load(id, config);
		tutor = new Tutor(config, lesson, overrides, sessionStats);
		started = false;
		paused = true;
		finished = false;
		sessionStats = new SessionStats(tutor.lessonConfig.checkMode);
		// historyNode.childNodes

		let child;
		while ((child = historyNode.firstChild)) historyNode.removeChild(child);
	}

	async function endLesson() {
		if (sessionStats.chars !== 0) {
			lesson.lessonEnd();

			if (config.logStats) {
				await showStatsConfirmDialog(config, sessionStats).then((v: boolean | undefined) => {
					if (v === true) {
						config.userStats.add(sessionStats);
						config.saveUserConfig();
					}
				});
			}
		}
		finished = true;
		return;
	}

	async function shortcuts(e: KeyboardEvent) {
		if (e.key === config.pause || e.key === 'Escape') {
			if (paused) {
				unpause();
				textbox?.focus();
			} else {
				pause(e);
			}
			if (!started) started = true;
			e.preventDefault();
		} else if (e.key === config.stop && started) {
			e.preventDefault();
			pause(e);
			confirmEndLesson();
		}
	}

	function handleClick(_: Event) {
		textbox?.focus();
	}

	function handleBeforeInput(e: InputEvent) {
		handleAction(tutor.handleBeforeInput(e));
	}

	function handleKeydown(e: KeyboardEvent) {
		handleAction(tutor.handleKeydown(e));
	}

	function handleAction<T = undefined>(action: Action, ctx: T | undefined = undefined) {
		switch (action) {
			case Action.WordReset:
			case Action.CharAdded:
			case Action.Refresh:
				tutor = tutor;
				break;
			case Action.LessonCompleted:
				tutor = tutor;
				lessonCompleted();
				break;
			case Action.MissedSpace:
				handleAction(Action.NextWord, true);
				addMissedSpace();
				break;
			case Action.NextWord:
				const n = tutor.nextWord();
				if (!Array.isArray(n)) {
					if (n !== Action.NextWord) handleAction(n);
					return;
				}
				if (n[0] !== undefined) {
					addToHistory(n[0]);
					if (ctx === undefined) addSpace();
				}
				tutor = tutor;
				break;
		}
	}

	async function scroll() {
		await tick();
		if (activeWord) {
			activeWord.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function addToHistory(w: WordState) {
		const c = new Word({
			target: historyNode,
			props: {
				word: w.wordChars,
				state: w.state
			}
		});
	}

	function addSpace() {
		const el = document.createElement('div');
		el.classList.add('spacer');
		// el.innerHTML =
		// 	"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path  d='M14.1 27.2l7.1 7.2 16.7-16.8'/></svg>";
		el.title = config.lang.space;
		historyNode.appendChild(el);
	}

	function addMissedSpace() {
		const el = document.createElement('div');
		el.classList.add('missed-space');
		// el.innerHTML =
		// 	"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path  d='M14.1 27.2l7.1 7.2 16.7-16.8'/></svg>";
		el.title = config.lang.missedSpace;
		historyNode.appendChild(el);
	}

	async function showSessionStatsDialog() {
		showStatsDialog(config.lang.statsDialogSessionTitle, config, sessionStats);
	}

	async function showUserStatsDialog() {
		showStatsDialog(config.lang.statsDialogUserTitle, config, config.userStats);
	}

	async function showAudioDialog(_: Event) {
		showVoiceDialog(config).then((audio?: Audio) => {
			if (audio !== undefined) {
				config.tts = audio;
				config.saveUserConfig();
			}
		});
	}

	async function showLessonConfig(): Promise<void> {
		return showLessonConfigDialog(config, lesson, tutor.overrides).then(
			(data?: [Lesson, Partial<LessonTypingConfig>]) => {
				if (data !== undefined) {
					let overrides: Partial<LessonTypingConfig>;
					[lesson, overrides] = data;
					Lesson.saveOverrides(lesson.baseLesson().id, overrides);
					reset(overrides);
				}
			}
		);
	}

	async function showConfig(_: Event) {
		showConfigDialog(config).then((conf?: Config) => {
			if (conf !== undefined) {
				console.log(conf);
				config = conf;
				reset();
				config.saveUserConfig();
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
				<button class="link" type="button" on:click={showConfig}
					>{config.lang.openConfigDialog}</button
				>
			</li>
			<li>
				<button class="link" type="button" on:click={showAudioDialog}
					>{config.lang.openTtsDialog}</button
				>
			</li>
			<li>
				<button class="link" type="button" on:click={showUserStatsDialog}
					>{config.lang.openUserStatsDialog}</button
				>
			</li>
		</ul>
	</header>

	{#if !finished}
		<nav>
			<div class="tutor-above">
				<div class="tutor-menu">
					<button type="button" class="link" on:click={showSessionStatsDialog}
						>{config.lang.openSessionStatsDialog}</button
					>
					<button class="link" on:click={showLessonConfig}
						>{config.lang.openLessonConfigDialog}</button
					>

					<button class="link stop-button" disabled={!started} on:click={confirmEndLesson}
						>{config.lang.stop}</button
					>
				</div>
				{#if !started}
					{config.lang.notStarted}
				{/if}
			</div>
		</nav>

		<!-- <section class="tutor"> -->
		<h1 class="tutor-title">
			{lesson.baseLesson().getName(config.lang)}
		</h1>

		<div class="tutor-words" class:paused class:char-mode={config.checkMode === CheckMode.Char}>
			<span bind:this={historyNode} class="history" /><Word
				bind:span={activeWord}
				word={tutor.word.wordChars}
				state={tutor.word.state}
				active={true}
			/><span class="spacer" /><span class="queue">
				{#each tutor.queue as q}
					<QueuedWord word={q} />{' '}
				{/each}
			</span>
		</div>
		<!-- </section> -->

		<div class="tutor-bottom">
			{#if paused && !started}
				<input
					class="tutor-input"
					bind:this={textbox}
					placeholder={config.lang.inputNotStarted}
					on:keydown={startInput}
				/>
			{:else if paused && started}
				<input
					class="tutor-input"
					bind:this={textbox}
					placeholder={config.lang.inputPaused}
					on:keydown={unpause}
				/>
			{:else}
				<input
					class="tutor-input"
					bind:this={textbox}
					value={tutor.word.input}
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
		<button type="button" on:click={() => reset()}>Again!</button>
	{/if}
</div>

<style>
	.tutor-center {
		margin: 0px 0px;
		height: 100%;
		width: 100%;
		display: flex;
		position: absolute;
		align-items: center;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		z-index: -10;
	}

	.tutor-center-wrapper {
		padding: 0rem 0px 20vh;
		width: 100%;
	}

	.tutor-above {
		width: 100%;
		text-align: center;
		margin: 0px 0px 2rem 0px;
	}

	.tutor {
		margin: auto;
		/* padding-bottom: 10rem; */
	}

	.tutor-title {
		font-size: 2rem;
		text-align: center;
		font-family: var(--font-transitional);
		font-weight: normal;
		margin: auto;
	}

	.tutor-words {
		--border-color: rgba(36, 58, 92, 0.4);
		--drop-shadow-color: rgba(36, 58, 92, 0.1);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		background: rgba(255, 255, 255, 1);
		font-family: var(--font-monospace);
		/* font-size: min(max(5vh, 1.5rem), 2rem); */
		/* font-size: clamp(1.4rem, 2vw, 1.8rem); */
		font-size: 1.7rem;
		margin: 0px auto;
		padding: 0px 1em;
		width: 80%;
		max-width: 28em;
		height: 12em;
		overflow: auto;
		text-align: justify;
		line-height: 2.8em;
		word-spacing: 0.3em;
		/* text-rendering: optimizeLegibility; */
		scroll-behavior: smooth;
		scroll-snap-type: y mandatory;
		filter: drop-shadow(1px 1px 2px var(--drop-shadow-color))
			drop-shadow(2px 2px 4px var(--drop-shadow-color))
			drop-shadow(4px 4px 8px var(--drop-shadow-color));
	}

	.tutor-bottom {
		text-align: center;
		position: absolute;
		bottom: 0px;
		left: 0px;
		width: 100%;
		margin: 0px auto;
		z-index: -20;
	}

	.tutor-input {
		/* border: 1px solid #bcc2c9;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
		box-sizing: border-box; */
		border: 0px;
		box-shadow: none !important;
		font-size: 1.2rem;
		width: 100%;
		max-width: 40ch;
		text-align: center;
		padding: 1.2rem 2rem;
		caret-color: transparent;
	}

	/* .tutor-input:focus {
		border-color: #f5c0ab;
		box-shadow: 0px 0px 4px #f5c0ab;
	} */

	.tutor-menu {
		font-size: 1.2rem;
		display: flex;
		width: 100%;
		max-width: calc(40ch + 2.4rem + 2px);
		margin: 0rem auto 0px;
		text-align: center;
		/* justify-content: space-between; */
	}

	.stop-button:not(.hidden) {
		animation: opacity-fadein 0.5s ease-out 0s 1;
	}

	@keyframes opacity-fadein {
		0% {
			opacity: 0;
		}
	}
</style>
