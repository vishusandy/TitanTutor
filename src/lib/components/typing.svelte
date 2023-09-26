<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import type { Session } from '$lib/session';
	import { prevent } from '$lib/util';
	import Word from './word.svelte';

	export let session: Session;
	let textbox: HTMLInputElement | undefined;
	let resume: string = '';
	let started: boolean = false;
	let paused: boolean = true;
	let done: boolean = false;

	let tutor = new Tutor(session);

	onMount(async () => {
		if (textbox) {
			textbox.placeholder = 'Press any key to start';
			paused = true;
			await tick();
			textbox.focus();
		}
	});

	async function start(e: Event | undefined) {
		if (textbox === undefined) return;

		started = true;
		paused = false;
		session.started = new Date();
		await tick();
		textbox.focus();
	}

	async function unpause(e: Event | undefined) {
		if (textbox === undefined) return;

		paused = false;
		session.started = new Date();
		await tick();
		textbox.focus();
	}

	function pause(e: Event | undefined) {
		if (textbox === undefined) return;
		console.log('pause');
		paused = true;
		textbox.placeholder = 'Paused';
		if (session.started !== undefined) {
			const now = new Date();
			session.dur += now.getTime() - session.started.getTime();
			session.started = undefined;
		}

		textbox.placeholder = 'Paused';
	}

	function handleClick(e: Event) {
		prevent(e);
		textbox?.focus();
	}

	function lessonCompleted() {
		endLesson();
	}

	function endLesson() {
		done = true;
	}

	function handleBeforeInput(e: InputEvent) {
		switch (tutor.handleBeforeInput(e)) {
			case Action.Refresh:
				tutor = tutor;
				break;
			case Action.lessonCompleted:
				tutor = tutor;
				lessonCompleted();
				break;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (tutor.handleKeydown(e)) {
			case Action.Refresh:
				tutor = tutor;
				break;
			case Action.lessonCompleted:
				tutor = tutor;
				lessonCompleted();
				break;
		}
	}
</script>

<div class="tutor" class:paused>
	{#each tutor.history as w}
		<Word word={w.wordChars} state={w.state} />{' '}
	{/each}
	<Word word={tutor.word.wordChars} state={tutor.word.state} active={true} />
	{#each tutor.queue as q}
		<Word word={q.wordChars} state={q.state} />{' '}
	{/each}
</div>

{#if !done}
	{#if paused && !started}
		<input
			class="textbox"
			bind:this={textbox}
			placeholder="Press any key to start"
			on:keydown={start}
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
			on:selectstart={prevent}
			on:mousedown={prevent}
			on:click={handleClick}
		/>
	{/if}
{/if}

<style>
	.paused {
		background: #f9f9f9;
	}
</style>
