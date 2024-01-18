<script lang="ts">
	import type { Config } from '$lib/types/config';
	import type { FormUserValue, FormUserValueReturn, OptAvailable } from '$lib/types/forms';
	import { onMount } from 'svelte';

	export let config: Config;
	export let label: string;
	export let id: string;
	export let userLabel: string = config.lang.useUserValue;
	export let onLabel: string = config.lang.on;
	export let offLabel: string = config.lang.off;
	export let initialState: FormUserValue<boolean>;
	export let override: OptAvailable<boolean>;

	let checkboxInput: HTMLInputElement;

	let state: FormUserValue<boolean> = override !== 'enabled' ? override : initialState;

	onMount(() => {
		updateCheckbox();
	});

	export function getData(): FormUserValueReturn<boolean> {
		return state === 'disabled' || state === 'user' ? undefined : state;
	}

	function updateCheckbox() {
		switch (state) {
			case 'disabled':
				checkboxInput.checked = false;
				checkboxInput.indeterminate = false;
				checkboxInput.disabled = true;
				break;
			case 'user':
				checkboxInput.checked = false;
				checkboxInput.indeterminate = true;
				break;
			case true:
				checkboxInput.checked = true;
				checkboxInput.indeterminate = false;
				break;
			case false:
				checkboxInput.checked = false;
				checkboxInput.indeterminate = false;
				break;
		}
	}

	function nextCheckboxState() {
		if (override !== 'enabled') return;

		switch (state) {
			case 'disabled':
				break;
			case 'user':
				state = true;
				break;
			case true:
				state = false;
				break;
			case false:
				state = 'user';
				break;
			default:
				state = 'disabled';
		}

		updateCheckbox();
	}
</script>

<div class="optional">
	<input
		disabled={override !== 'enabled' || state === 'disabled'}
		bind:this={checkboxInput}
		on:click={nextCheckboxState}
		{id}
		type="checkbox"
	/>
	<label for={id} class:disabled={override !== 'enabled' || state === 'disabled'}>{label}</label>
</div>
<div class="label" class:disabled={override !== 'enabled' || state === 'disabled'}>
	{#if state === 'user'}
		{userLabel}
	{:else if state === true}
		{onLabel}
	{:else if state === false}
		{offLabel}
	{/if}
</div>

<style>
	.optional {
		display: flex;
	}
</style>
