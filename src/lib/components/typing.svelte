<script lang="ts">
	import { onMount, tick } from 'svelte';

	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';

	import type { Config, LessonTypingConfig } from '$lib/config';
	import {
		getUserLessonOverrides,
		saveLesson,
		type Lesson,
		loadLesson
	} from '$lib/lessons/lessons';
	import { SessionStats } from '$lib/stats';
	import type { WordState } from '$lib/word_state';
	import { Tutor } from '$lib/tutor';
	import { Action } from '$lib/types';
	import { showLessonConfigDialog, showStatsConfirmDialog, showStatsDialog } from '$lib/dialog';

	export let config: Config;
	export let lesson: Lesson;
	export let sessionStats: SessionStats;

	let tutor = new Tutor(
		config,
		lesson,
		getUserLessonOverrides(lesson.getLessonName()),
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
		if (textbox) {
			started = false;
			await tick();
			textbox.focus();
		}
	});

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
		const lessonName = lesson.getLessonName();
		if (overrides === undefined) overrides = getUserLessonOverrides(lessonName);

		lesson = await loadLesson(lessonName);
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
					let overrides;
					[lesson, overrides] = data;
					reset(overrides);
					saveLesson(lesson, true);
				}
			}
		);
	}
</script>

<svelte:document on:keydown={shortcuts} />

{#if !finished}
	<div class="tutor-menu">
		<button type="button" class="link" on:click={showSessionStatsDialog}
			>{config.lang.openSessionStatsDialog}</button
		>
		<button class="link stop-button" on:click={confirmEndLesson} class:hidden={!started}
			>{config.lang.stop}</button
		>
		<button class="link" on:click={showLessonConfig}>{config.lang.openLessonConfigDialog}</button>
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

	<div class="tutor-input">
		{#if paused && !started}
			<input
				class="textbox"
				bind:this={textbox}
				placeholder={config.lang.inputNotStarted}
				on:keydown={startInput}
			/>
		{:else if paused && started}
			<input
				class="textbox"
				bind:this={textbox}
				placeholder={config.lang.inputPaused}
				on:keydown={unpause}
			/>
		{:else}
			<input
				class="textbox"
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
	<!-- <a data-sveltekit-reload href="/">Again!</a> -->
	<button type="button" on:click={() => reset()}>Again!</button>
{/if}

<style>
	/* .tutor {
		--tutorWidth: 100%;
		 width: var(--tutorWidth);
		margin: 4rem auto 2rem; 
	} */

	.tutor-words {
		font-family: var(--font-system);
		padding: 2rem 0px;
		overflow-x: hidden;
		overflow-y: hidden;
		white-space: nowrap;
		border-radius: 0.3rem;
		margin: 2rem auto;
		scroll-behavior: smooth;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
	}

	.tutor-input {
		text-align: center;
	}

	.textbox {
		border: 1px solid #bcc2c9;
		box-sizing: border-box;
		font-size: 1.2rem;
		width: 100%;
		max-width: 40ch;
		text-align: center;
		padding: 1.2rem 2rem;
		caret-color: transparent;
	}

	.textbox:focus {
		box-shadow: none;
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
		margin: 0px auto;
		justify-content: space-between;
	}

	.stop-button {
		transition: opacity 0.5s ease-out;
		/* opacity: 1; */
	}
</style>
