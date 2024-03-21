<script lang="ts">
	export let inheritLabel: string;
</script>

<div class="inherit">
	<div class="inherit-label">{inheritLabel}</div>
	<div class="inherit-value">
		<slot />
	</div>
</div>

<style>
	.inherit {
		font-family: var(--font-humanist);
		display: flex;
		align-items: center;
		color: #888;
	}

	.inherit-label {
		margin-inline-end: 1rem;
	}
	.inherit-value {
		font-style: italic;
	}
</style>
