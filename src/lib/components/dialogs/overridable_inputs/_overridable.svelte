<script lang="ts" generics="T">
	import { createEventDispatcher } from 'svelte';

	import type { OptAvailable } from '$lib/types/forms';

	export let label: string;
	export let id: string;
	export let override: OptAvailable<T>;
	export let overrideMessage: string;
	export let inherit: boolean;

	const dispatch = createEventDispatcher();
	let override_id = id + '';
	let inheritCheckbox: HTMLInputElement;

	let notInherited = !inherit;

	if (id === 'random')
		console.log(`initializing random: override=${override} inherit=${inherit} notInherited=${notInherited}`);

	export function getState(): boolean {
		return inherit;
	}

	function sendUpdate() {
		dispatch('inheritUpdate', {});
	}

	function changeInherit() {
		if (override === 'enabled') {
			notInherited = inheritCheckbox.checked;
			inherit = !notInherited;
			sendUpdate();
		}
	}
</script>

<div class="optional">
	<input
		id={override_id}
		on:change={changeInherit}
		checked={override === 'enabled' && notInherited}
		bind:this={inheritCheckbox}
		type="checkbox"
		disabled={override !== 'enabled'}
	/>
	<label for={override_id} class:disabled={override !== 'enabled'}>{label}</label>
</div>

{#if override !== 'enabled'}
	<div class="override">
		<div class="override-value">
			<!-- <div class="override-label">{overrideLabel}</div> -->
			<div class="override-slot">
				<slot name="override" />
			</div>
		</div>
		{#if overrideMessage !== ''}
			<div class="override-label">
				{overrideMessage}
			</div>
		{/if}
	</div>
{:else if inherit}
	<div class="inherit-value">
		<slot name="inherit" />
	</div>
{:else}
	<slot name="value" />
{/if}

<style>
	.optional {
		display: flex;
	}

	.override {
		align-self: start;
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

	/* .override-message {
		margin-top: 0.5em;
		color: #9d9d9d;
	} */
</style>
