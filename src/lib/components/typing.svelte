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
	let paused: boolean = true;

	let tutor = new Tutor(session);

	onMount(async () => {
		registerStartEvents();
	});

	async function registerStartEvents() {
		if (textbox === undefined) return;

		textbox.addEventListener('keydown', start);
		paused = true;
		await tick();
		textbox.focus();
	}

	function registerInputEvents(box: HTMLInputElement) {
		box.addEventListener('keydown', handleKeydown);
		box.addEventListener('beforeinput', handleBeforeInput);
		box.addEventListener('selectstart', prevent);
		box.addEventListener('mousedown', prevent);
		box.addEventListener('click', handleClick);
	}

	function unregisterInputEvents() {
		if (textbox === undefined) return;

		textbox.removeEventListener('beforeinput', handleBeforeInput);
		textbox.removeEventListener('keydown', handleKeydown);
		textbox.removeEventListener('selectstart', prevent);
		textbox.removeEventListener('mousedown', prevent);
		textbox.removeEventListener('click', handleClick);
	}

	function start(e: Event | undefined) {
		if (textbox === undefined) return;

		session.started = new Date();
		textbox.value = resume;
		resume = '';
		textbox.placeholder = '';
		textbox.removeEventListener('keydown', start);
		registerInputEvents(textbox);
		paused = false;
		textbox.addEventListener('blur', pause);
	}

	function pause(e: Event | undefined) {
		if (textbox === undefined) return;

		resume = tutor.word.input;
		textbox.value = '';
		if (session.started !== undefined) {
			const now = new Date();
			session.dur += now.getTime() - session.started.getTime();
			session.started = undefined;
		}

		unregisterInputEvents();
		textbox.placeholder = 'Paused';
		registerStartEvents();
	}

	function handleClick(e: Event) {
		prevent(e);
		textbox?.focus();
	}

	function lessonCompleted() {
		console.log('Lesson completed');
		endLesson();
	}

	function endLesson() {
		unregisterInputEvents();
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

<input
	class="textbox"
	bind:this={textbox}
	value={tutor.word.input}
	placeholder="Press any key to start"
/>

<style>
	.paused {
		background: #f9f9f9;
	}
</style>
