<script lang="ts">
	import Letter from './letter.svelte';
	import { LetterState } from '$lib/types';
	import { onMount } from 'svelte';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
	export let span: HTMLSpanElement | undefined = undefined;
	let success = state.every((s) => s !== LetterState.Error);

	onMount(() => {
		if (!span || !success) return;
		span.classList.add('success');
	});
</script>

{#if word.length !== 0}
	<span class="word" bind:this={span} class:active>
		{#each word as c, i}
			<Letter letter={c} state={state[i]} />
		{/each}
	</span>
{/if}
