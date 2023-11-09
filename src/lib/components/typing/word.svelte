<script lang="ts">
	import { onMount } from 'svelte';

	import { LetterState } from '$lib/types';

	export let word: string[];
	export let state: LetterState[];
	export let active: boolean = false;
	export let span: HTMLSpanElement | undefined = undefined;

	let success = state.every((s) => s === LetterState.Complete);
	let error = state.some((s) => s === LetterState.Error);

	onMount(() => {
		if (!span) return;
	});
</script>

{#if word.length !== 0}
	<span class="word" bind:this={span} class:active class:success class:error>
		{#each word as c, i}
			<span
				class="letter"
				class:incomplete={state[i] === LetterState.Incomplete}
				class:active={state[i] === LetterState.Active}
				class:complete={state[i] === LetterState.Complete}
				class:error={state[i] === LetterState.Error}>{c}</span
			>
		{/each}
	</span>
{/if}
