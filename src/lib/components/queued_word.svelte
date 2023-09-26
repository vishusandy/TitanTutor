<script lang="ts">
	export let word: string;
</script>

{#if word.length !== 0}
	<span class="queued-word">
		{word}
	</span>
{/if}

<style>
	.queued-word {
		margin: 0.1em 0.1em;
		border: 1px solid transparent;
	}
</style>
