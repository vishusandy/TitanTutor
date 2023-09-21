<script lang="ts">
	import Letter from './letter.svelte';
	import type { LetterState } from '$lib/types';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
</script>

<span class="word" class:active>
	{#each word as c, i}
		<Letter letter={c} state={state[i]} />
	{/each}
</span>

<style>
	.word {
		margin: 0.1rem 0.2rem;
		border: 1px solid transparent;
	}
	.active {
		margin: 0.1rem 0.2rem;
		border: 1px solid green;
	}
</style>
