<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import type { Session } from '$lib/session';
	import Word from './word.svelte';
	import QueuedWord from './queued_word.svelte';

	export let session: Session;

	let tutor = new Tutor(session);
	let textbox: HTMLInputElement | undefined;
	let activeWord: HTMLElement | undefined;
	let started: boolean = false;
	let paused: boolean = true;
	let done: boolean = false;

	$: {
		console.log(`tutor.word = ${tutor.word.word}`);
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
		if ('key' in e && e.key === 'F4') {
			e.preventDefault();
			return;
		}

		started = true;
		unpause(e);
	}

	async function unpause(e: Event) {
		if (textbox === undefined) return;

		paused = false;
		session.stats.resume();

		await tick();
		textbox.focus();
	}

	function pause(e: Event) {
		if (textbox === undefined) return;

		paused = true;
		session.stats.pause();
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

		if (e.key === 'F4') {
			paused ? unpause(e) : pause(e);
			e.preventDefault();
		} else if (e.key === 'F7') {
			e.preventDefault();
			pause(e);

			if (window.confirm('Are you sure you want to stop?')) {
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

<div class="tutor" class:paused>
	{#each tutor.history as w}
		<Word word={w.word} state={w.state} />{' '}
	{/each}

	<Word bind:span={activeWord} word={tutor.word.wordChars} state={tutor.word.state} active={true} />

	{#each tutor.queue as q}
		<QueuedWord word={q} />{' '}
	{/each}
</div>

{#if !done}
	{#if paused && !started}
		<input
			class="textbox"
			bind:this={textbox}
			placeholder="Press any key to start"
			on:keydown={startInput}
		/>
	{:else if paused && started}
		<input
			class="textbox"
			bind:this={textbox}
			placeholder="Paused"
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

<style>
	.tutor {
		width: 50ch;
		padding: 1rem;
		overflow-x: auto;
		overflow-y: hidden;
		white-space: nowrap;
		margin: 2rem 1rem;
		scroll-snap-type: x mandatory;
		scrollbar-width: thin;
		-webkit-overflow-scrolling: touch;
	}

	.paused {
		background: #f9f9f9;
	}
</style>
