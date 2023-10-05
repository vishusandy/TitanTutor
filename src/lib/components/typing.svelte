<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import Word from './word.svelte';
	import QueuedWord from './queued_word.svelte';
	import type { Lesson } from '$lib/lessons/lessons';
	import type { LessonOptions } from '$lib/lessons/options';
	import type { SessionStats } from '$lib/stats';
	import type { Config } from '$lib/config';
	import type { Language } from '$lib/language';
	import type { KbMapping } from '$lib/mappings';

	export let config: Config;
	export let kbmap: KbMapping;
	export let lang: Language;
	export let lesson: Lesson;
	export let lessonOpts: LessonOptions;
	export let sessionStats: SessionStats;

	let tutor = new Tutor(config, kbmap, lesson, lessonOpts, sessionStats);
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
		if ('key' in e && e.key === config.pause) {
			e.preventDefault();
			return;
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
		if (!started) return;

		if (e.key === config.pause || e.key === 'Escape') {
			paused ? unpause(e) : pause(e);
			e.preventDefault();
		} else if (e.key === config.stop) {
			e.preventDefault();
			pause(e);

			if (window.confirm(lang.stopMsg)) {
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
				// scroll();
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
					placeholder={lang.inputNotStarted}
					on:keydown={startInput}
				/>
			{:else if paused && started}
				<input
					class="textbox"
					bind:this={textbox}
					placeholder={lang.inputPaused}
					on:focus={unpause}
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
	.tutor-input {
		text-align: center;
	}
	.tutor-words {
		width: 50ch;
		max-width: 80%;
		padding: 1rem 0px;
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		margin: 2rem auto;
		/* scrollbar-width: thin; */
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
	}

	.tutor-words :global(.word:first-of-type) {
		margin-left: 4ch;
	}

	.tutor-words :global(.word:last-of-type) {
		margin-right: 4ch;
	}

	.paused {
		background: #f9f9f9;
	}
</style>
