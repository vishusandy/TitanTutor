<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';
	import type { Lesson } from '$lib/lessons/lessons';
	import type { SessionStats } from '$lib/stats';
	import type { Config } from '$lib/config';

	export let config: Config;
	export let lesson: Lesson;
	export let sessionStats: SessionStats;

	let tutor = new Tutor(config, lesson, sessionStats);
	let textbox: HTMLInputElement | undefined;
	let activeWord: HTMLElement | undefined;
	let started: boolean = false;
	let paused: boolean = true;
	let done: boolean = false;

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
		unpause(e);
	}

	async function unpause(e: Event) {
		if (textbox === undefined) return;

		paused = false;
		sessionStats.resume();

		await tick();
		textbox.focus();
	}

	function pause(e: Event) {
		if (textbox === undefined) return;

		paused = true;
		sessionStats.pause();
	}

	function handleClick(e: Event) {
		textbox?.focus();
	}

	function lessonCompleted() {
		endLesson();
	}

	function endLesson() {
		done = true;
	}

	async function shortcuts(e: KeyboardEvent) {
		if (e.key === config.pause || e.key === 'Escape') {
			if (paused) {
				unpause(e);
				textbox?.focus();
			} else {
				pause(e);
			}

			if (!started) started = true;
			e.preventDefault();
		} else if (e.key === config.stop && started) {
			e.preventDefault();
			pause(e);

			if (window.confirm(config.lang.stopMsg)) {
				endLesson();
			}
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
			case Action.lessonCompleted:
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
</script>

<svelte:document on:keydown={shortcuts} />

<div class="tutor">
	<div class="tutor-words" class:paused>
		{#each tutor.history as w}
			<Word word={w.word} state={w.state} />{' '}
		{/each}

		<Word
			bind:span={activeWord}
			word={tutor.word.wordChars}
			state={tutor.word.state}
			active={true}
		/>

		{#each tutor.queue as q}
			<QueuedWord word={q} />{' '}
		{/each}
	</div>

	<div class="tutor-input">
		{#if !done}
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
		{/if}
	</div>
</div>

<style>
	.tutor {
		--tutorWidth: 70ch;
		--tutorMaxWidth: 80%;
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
		box-shadow: inset 0px -1px 7px rgba(31, 155, 0, 0.445);
		/* scrollbar-width: thin; */
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		background-color: #faf8f2;
	}

	.tutor-input {
		text-align: center;
	}

	.tutor-words :global(.word:first-of-type) {
		margin-left: calc(min(var(--tutorWidth), 100%) / 2);
	}

	.tutor-words :global(.word:last-of-type) {
		margin-right: calc(min(var(--tutorWidth), 100%) / 2);
	}

	.paused {
		box-shadow: inset 0px -1px 7px rgba(148, 137, 120, 0.445);
	}
</style>
