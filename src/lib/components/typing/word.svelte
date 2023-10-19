<script lang="ts">
	import { onMount } from 'svelte';

	import Letter from './letter.svelte';
	import { LetterState } from '$lib/types';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
	export let span: HTMLSpanElement | undefined = undefined;

	let success = state.every((s) => s !== LetterState.Error);
	let error = state.some((s) => s === LetterState.Error);

	onMount(() => {
		if (!span) return;
		// if(success)
		// span.classList.add('success');
		// if(error)
		// span.class
	});
</script>

{#if word.length !== 0}
	<span class="word" bind:this={span} class:active class:success class:error>
		{#each word as c, i}
			<Letter letter={c} state={state[i]} />
		{/each}
	</span>
{/if}
