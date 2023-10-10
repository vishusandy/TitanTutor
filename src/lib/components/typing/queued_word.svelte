<script lang="ts">
	export let word: string;
</script>

{#if word.length !== 0}
	<span class="word queued">
		{word}
	</span>
{/if}
