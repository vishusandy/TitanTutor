<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import type { Session } from '$lib/session';
	import { stop } from '$lib/util';
	import Word from './word.svelte';

	export let session: Session;
	let textbox: HTMLInputElement | undefined;

	let tutor = new Tutor(session);

	onMount(async () => {
		if (textbox !== undefined) {
			registerStartEvents(textbox);
		}
	});

	async function registerStartEvents(box: HTMLInputElement) {
		box.addEventListener('keydown', handleStartEvents);
		await tick();
		box.focus();
	}

	function handleStartEvents(e: KeyboardEvent) {
		if (textbox !== undefined) {
			textbox.placeholder = '';
			textbox.removeEventListener('keydown', handleStartEvents);
			registerInputEvents(textbox);
		}
	}

	async function registerInputEvents(box: HTMLInputElement) {
		box.addEventListener('keydown', handleKeydown);
		box.addEventListener('beforeinput', handleBeforeInput);
		box.addEventListener('selectstart', stop);
		box.addEventListener('mousedown', stop);
		box.addEventListener('click', (e) => {
			stop(e);
			box?.focus();
		});
	}

	onDestroy(() => {
		if (textbox !== undefined) {
			textbox.removeEventListener('beforeinput', handleBeforeInput);
			textbox.removeEventListener('keydown', handleKeydown);
			textbox.removeEventListener('selectstart', stop);
			textbox.removeEventListener('mousedown', stop);
		}
	});

	function lessonCompleted() {
		endLesson();
	}

	function endLesson() {}

	function handleBeforeInput(e: InputEvent) {
		switch (tutor.handleBeforeInput(e)) {
			case Action.Refresh:
				tutor = tutor;
				break;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (tutor.handleKeydown(e)) {
			case Action.Refresh:
				tutor = tutor;
				break;
		}
	}
</script>

<div>
	{#each tutor.history as w}
		<Word word={w.wordChars} state={w.state} />
	{/each}
	<Word word={tutor.word.wordChars} state={tutor.word.state} active={true} />
	{#each tutor.queue as q}
		<Word word={q.wordChars} state={q.state} />
	{/each}
</div>

<input
	class="textbox"
	bind:this={textbox}
	value={tutor.word.input}
	placeholder="Press any key to start"
/>

<style>
</style>
