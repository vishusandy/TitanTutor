<script lang="ts">
	import Letter from './letter.svelte';
	import type { LetterState } from '$lib/types';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
</script>

{#if word.length !== 0}
	<span class="word" class:active-word={active}>
		{#each word as c, i}
			<Letter letter={c} state={state[i]} />
		{/each}
	</span>
{/if}

<style>
	.word {
		margin: 0.1em 0.1em;
		border: 1px solid transparent;
	}
	.active-word {
		margin: 0.1em 0.1em;
		border: 1px solid green;
	}
</style>
