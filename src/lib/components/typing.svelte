<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import type { Session } from '$lib/session';
	import { prevent } from '$lib/util';
	import Word from './word.svelte';
	import QueuedWord from './queued_word.svelte';

	export let session: Session;

	let tutor = new Tutor(session);
	let textbox: HTMLInputElement | undefined;
	let started: boolean = false;
	let paused: boolean = true;
	let done: boolean = false;

	onMount(async () => {
		document.addEventListener('keydown', shortcuts);
		if (textbox) {
			started = false;
			await tick();
			textbox.focus();
		}
	});

	async function shortcuts(e: KeyboardEvent) {
		console.log(started);
		if (started) {
			if (e.key === 'F4') {
				if (paused) {
					unpause(e);
				} else {
					pause(e);
				}

				e.preventDefault();
			}
		}
	}

	async function start(e: Event) {
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
		session.started = new Date();
		await tick();
		textbox.focus();
	}

	function pause(e: Event) {
		if (textbox === undefined) return;

		paused = true;
		if (session.started !== undefined) {
			const now = new Date();
			session.dur += now.getTime() - session.started.getTime();
			session.started = undefined;
		}
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
		<Word word={w.word} state={w.state} />{' '}
	{/each}
	<Word word={tutor.word.wordChars} state={tutor.word.state} active={true} />
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
