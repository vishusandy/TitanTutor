<script lang="ts">
	import Letter from './letter.svelte';
	import type { LetterState } from '$lib/types';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
	export let span: HTMLSpanElement | undefined = undefined;
</script>

{#if word.length !== 0}
	<span class="word" bind:this={span} class:active>
		{#each word as c, i}
			<Letter letter={c} state={state[i]} />
		{/each}
	</span>
{/if}
