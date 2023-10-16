<script lang="ts">
	import { SvelteComponent, onMount, tick } from 'svelte';
	import { Action, LetterState } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';
	import type { Lesson } from '$lib/lessons/lessons';
	import type { SessionStats } from '$lib/stats';
	import type { Config } from '$lib/config';
	import { createStatsDialog } from '$lib/dialog';
	import type { WordState } from '$lib/word_state';

	export let config: Config;
	export let lesson: Lesson;
	export let sessionStats: SessionStats;

	let tutor = new Tutor(config, lesson, sessionStats);
	let textbox: HTMLInputElement | undefined;
	let activeWord: HTMLElement | undefined;
	let started: boolean = false;
	let paused: boolean = true;
	let finished: boolean = false;
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
		sessionStats.pause();
	}

	function handleClick(e: Event) {
		textbox?.focus();
	}

	async function lessonCompleted() {
		endLesson();
	}

	async function endLesson() {
		if (config.logStats) {
			config.userStats.add(sessionStats);
		}

		config.saveUserConfig();
		finished = true;

		createStatsDialog(config.lang.statsDialogSessionTitle, config, sessionStats);
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

	function confirmEndLesson() {
		if (window.confirm(config.lang.stopMsg)) {
			endLesson();
		}
	}

	function handleBeforeInput(e: InputEvent) {
		handleAction(tutor.handleBeforeInput(e));
	}

	function handleKeydown(e: KeyboardEvent) {
		handleAction(tutor.handleKeydown(e));
	}

	function handleAction(action: Action) {
		switch (action) {
			case Action.Refresh:
				tutor = tutor;
				break;
			case Action.NextWord:
				const n = tutor.nextWord();

				if (!Array.isArray(n)) {
					// prevent recursion (shouldn't happen, but just to be safe...)
					if (n !== Action.NextWord) handleAction(n);

					return;
				}

				if (n[0] !== undefined) {
					addToHistory(n[0]);
				}

				tutor = tutor;
				break;
			case Action.LessonCompleted:
				tutor = tutor;
				lessonCompleted();
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
		createStatsDialog(config.lang.statsDialogSessionTitle, config, sessionStats);
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
</script>

<svelte:document on:keydown={shortcuts} />

{#if !finished}
	<div class="tutor">
		<div class="tutor-menu">
			<button type="button" class="link" on:click={showSessionStatsDialog}
				>{config.lang.openSessionStatsDialog}</button
			>
			{#if started}
				<!-- <button type="button" class="link pause-button" class:paused on:click={pause} /> -->
				<button class="link stop-button" on:click={confirmEndLesson}>{config.lang.stop}</button>
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
	</div>
{:else}
	<a data-sveltekit-reload href="/">Again!</a>
{/if}

<style>
	.tutor {
		--tutorWidth: 100%;
		--tutorMaxWidth: 100%;
		width: var(--tutorWidth);
		max-width: var(--tutorMaxWidth);
		margin: 4rem auto 2rem;
	}

	.tutor-words {
		font-family: var(--font-system);
		padding: 2rem 0px;
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		border-radius: 0.3rem;
		margin: 2rem auto;
		/* box-shadow: inset 0px -1px 7px rgba(31, 155, 0, 0.445); */
		/* scrollbar-width: thin; */
		scroll-behavior: smooth;
		scrollbar-width: none;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		/* background-color: #faf8f2; */
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
	}

	.textbox:focus {
		box-shadow: none;
		/* border: 1px solid #faf8f2; */
	}

	.history {
		margin-left: calc(min(var(--tutorWidth), 100%) / 2);
	}

	.queue {
		margin-right: calc(min(var(--tutorWidth), 100%) / 2);
	}

	.tutor-words.paused {
		/* box-shadow: inset 0px -1px 7px rgba(148, 137, 120, 0.445); */
	}

	.pause-button.paused {
		width: 0.8rem;
		height: 0.8rem;
		background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M 0 0'/%3e%3c/svg%3e");
		/* background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e"); */
	}

	.tutor-menu {
		text-align: center;
	}
</style>
