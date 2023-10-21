<script lang="ts">
	import { onMount, tick } from 'svelte';

	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';

	import type { Config, LessonTypingConfig } from '$lib/config';
	import {
		getLocalStorageLessonOverrides,
		type Lesson,
		loadLesson,
		saveUserLessonOverrides,
		saveLast
	} from '$lib/lessons/lessons';
	import { SessionStats } from '$lib/stats';
	import type { WordState } from '$lib/word_state';
	import { Tutor } from '$lib/tutor';
	import { Action } from '$lib/types';
	import {
		showLessonConfigDialog,
		showStatsConfirmDialog,
		showStatsDialog,
		showVoiceDialog
	} from '$lib/dialog';
	import type { Audio } from '$lib/audio';

	export let config: Config;
	export let lesson: Lesson;
	export let sessionStats: SessionStats;

	let tutor = new Tutor(
		config,
		lesson,
		getLocalStorageLessonOverrides(lesson.baseLesson().id),
		sessionStats
	);

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
		saveLast(lesson);
	});

	function handleBodyClick() {
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

	function pause(e: Event) {
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
		console.log('resetting', overrides);
		if (overrides === undefined) overrides = getLocalStorageLessonOverrides(id);

		lesson = await loadLesson(id);
		tutor = new Tutor(config, lesson, overrides, sessionStats);
		started = false;
		paused = true;
		finished = false;
		sessionStats = new SessionStats(tutor.lessonConfig.checkMode);
	}

	async function endLesson() {
		if (config.logStats && sessionStats.chars !== 0) {
			await showStatsConfirmDialog(config, sessionStats).then((v: boolean | undefined) => {
				if (v === true) {
					config.userStats.add(sessionStats);
					config.saveUserConfig();
				}
			});
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

	function handleClick(e: Event) {
		textbox?.focus();
	}

	function handleBeforeInput(e: InputEvent) {
		handleAction(tutor.handleBeforeInput(e));
	}

	function handleKeydown(e: KeyboardEvent) {
		handleAction(tutor.handleKeydown(e));
	}

	function handleAction(action: Action) {
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
				handleAction(Action.NextWord);
				addMissedSpace();
				break;
			case Action.NextWord:
				const n = tutor.nextWord();
				if (!Array.isArray(n)) {
					if (n !== Action.NextWord) handleAction(n);
					return;
				}
				if (n[0] !== undefined) addToHistory(n[0]);
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

	async function showSessionStatsDialog() {
		showStatsDialog(config.lang.statsDialogSessionTitle, config, sessionStats);
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

	function addMissedSpace() {
		const el = document.createElement('span');
		el.classList.add('missed-space');
		historyNode.appendChild(el);
	}

	async function showLessonConfig(): Promise<void> {
		return showLessonConfigDialog(config, lesson, tutor.overrides).then(
			(data?: [Lesson, Partial<LessonTypingConfig>]) => {
				if (data !== undefined) {
					let overrides: Partial<LessonTypingConfig>;
					[lesson, overrides] = data;
					reset(overrides);
					saveUserLessonOverrides(lesson.baseLesson().id, overrides);
				}
			}
		);
	}

	async function showAudioDialog(_: Event) {
		showVoiceDialog(config).then((audio?: Audio) => {
			if (audio !== undefined) {
				config.tts = audio;
				config.saveUserConfig();
			}
		});
	}

	async function showUserStatsDialog() {
		showStatsDialog(config.lang.statsDialogUserTitle, config, config.userStats);
	}
</script>

<svelte:document on:keydown={shortcuts} />
<nav class="header">
	<ul>
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
</nav>

{#if !finished}
	<div class="tutor-title">
		{lesson.baseLesson().getName(config.lang)}
	</div>

	<div class="tutor-center">
		<div class="tutor-center-wrapper">
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

			<div class="tutor-words" class:paused>
				<span bind:this={historyNode} class="history" />

				<Word
					bind:span={activeWord}
					word={tutor.word.wordChars}
					state={tutor.word.state}
					active={true}
				/>

				<span class="queue">
					{#each tutor.queue as q}
						<QueuedWord word={q} />{' '}
					{/each}
				</span>
			</div>
		</div>
	</div>

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
		z-index: 10;
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

	.tutor-title {
		font-size: 2rem;
		text-align: center;
	}

	.tutor-words {
		background: white;
		font-family: var(--font-system);
		font-size: min(max(5vh, 1.5rem), 2rem);
		font-size: clamp(1rem, 5vh, 2rem);
		margin: auto;
		padding: 0px;
		width: 100%;
		overflow-x: hidden;
		overflow-y: hidden;
		white-space: nowrap;
		border-radius: 0.3rem;
		scroll-behavior: smooth;
		scroll-snap-type: x mandatory;
	}

	.tutor-bottom {
		text-align: center;
		position: absolute;
		bottom: 0px;
		left: 0px;
		width: 100%;
		margin: 0px auto;
	}

	.tutor-input {
		border: 1px solid #bcc2c9;
		border-bottom-left-radius: 0px;
		border-bottom-right-radius: 0px;
		box-sizing: border-box;
		font-size: 1.2rem;
		width: 100%;
		max-width: 40ch;
		text-align: center;
		padding: 1.2rem 2rem;
		caret-color: transparent;
	}

	.tutor-input:focus {
		border-color: #f5c0ab;
		box-shadow: 0px 0px 4px #f5c0ab;
	}

	.history {
		margin-left: calc(100% / 2);
	}

	.queue {
		margin-right: calc(100% / 2);
	}

	.tutor-menu {
		font-size: 1.2rem;
		display: flex;
		width: 100%;
		max-width: calc(40ch + 2.4rem + 2px);
		margin: 0rem auto 0px;
		justify-content: space-between;
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
