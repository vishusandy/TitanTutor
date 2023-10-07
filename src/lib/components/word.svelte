<script lang="ts">
	import Letter from './letter.svelte';
	import type { LetterState } from '$lib/types';
	import { onMount } from 'svelte';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
	export let span: HTMLSpanElement | undefined = undefined;

	// onMount(() => {
	// 	console.log(`mounting ${word}. State:`, state);
	// });
</script>

{#if word.length !== 0}
	<span class="word" bind:this={span} class:active-word={active}>
		{#each word as c, i}
			<Letter letter={c} state={state[i]} />
		{/each}
	</span>
{/if}

<style>
	.word {
		margin: 0.1em 0.1em;
		border: 1px solid transparent;
		scroll-snap-align: center;
	}

	.active-word {
		scroll-snap-stop: always;
		margin: 0.1em 0.1em;
		border: 1px solid green;
	}

	:not(.active-word) :global(.complete) {
		color: green;
	}
</style>
