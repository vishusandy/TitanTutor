<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Action } from '$lib/types';
	import { Tutor } from '$lib/tutor';
	import type { Session } from '$lib/session';
	import Word from './word.svelte';

	export let session: Session;

	let tutor = new Tutor(session);

	onMount(() => {
		document.addEventListener('keydown', handleInput);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleInput);
	});

	function lessonCompleted() {
		endLesson();
	}

	function endLesson() {}

	function handleInput(e: KeyboardEvent) {
		switch (tutor.handleInput(e)) {
			case Action.Refresh:
				tutor = tutor;
				break;
		}
	}
</script>

<div id="history">
	{#each tutor.history as w}
		<Word word={w.word} state={w.state} />
	{/each}
	<Word word={tutor.currentWord.word} state={tutor.currentWord.state} active={true} />
	{#each tutor.queue as q}
		<Word word={q.word} state={q.state} />
	{/each}
</div>
<div id="typing">{tutor.currentWord.input}</div>

<style>
</style>
