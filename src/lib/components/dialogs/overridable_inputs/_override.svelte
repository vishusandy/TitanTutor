<script lang="ts">
	export let overrideLabel: string;
	export let overrideMessage: string = '';
</script>

<div class="override">
	<div class="override-value">
		<div class="override-label">{overrideLabel}</div>
		<div class="override-slot">
			<slot />
		</div>
	</div>
	{#if overrideMessage !== ''}
		<div class="override-message">
			{overrideMessage}
		</div>
	{/if}
</div>

<style>
	.override {
		display: flex;
		flex-flow: column;
		font-family: var(--font-humanist);
		color: #888;
	}
	.override-value {
		display: flex;
		align-items: center;
	}
	.override-label {
		/* color: #ce2d2d; */
		color: #b62e2e;
		margin-inline-end: 1rem;
	}
	.override-slot {
		font-style: italic;
	}

	.override-message {
		margin-top: 0.5em;
		color: #9d9d9d;
	}
</style>
