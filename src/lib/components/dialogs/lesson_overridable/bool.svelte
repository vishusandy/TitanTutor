<script lang="ts">
	import type { Config } from '$lib/types/config';
	import type { FormUserValue, OptAvailable } from '$lib/types/forms';
	import { updateProperties } from '$lib/util/dom';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let config: Config;
	export let label: string;
	export let id: string;
	export let userLabel: string = config.lang.useUserValue;
	export let onLabel: string = config.lang.on;
	export let offLabel: string = config.lang.off;
	export let initialState: FormUserValue<boolean>;
	export let override: OptAvailable<boolean>;

	const dispatch = createEventDispatcher();
	let checkboxInput: HTMLInputElement;

	let state: FormUserValue<boolean> = override !== 'enabled' ? override : initialState;
	$: state = override !== 'enabled' ? override : state;
	let isDisabled: boolean = override !== 'enabled' || state === 'disabled';
	$: {
		override;
		console.log(`reacting to override change for ${id}`);
	}
	$: {
		isDisabled = override !== 'enabled' || state === 'disabled';
		if (checkboxInput) updateCheckbox();
	}

	onMount(() => {
		updateCheckbox();
	});

	export function getState(): FormUserValue<boolean> {
		return state;
	}

	function sendUpdate() {
		dispatch('updateForm', {});
	}

	function updateCheckbox() {
		if (isDisabled) {
			updateProperties(checkboxInput, false, false, true);
			return;
		}

		switch (state) {
			case 'user':
				updateProperties(checkboxInput, false, true);
				break;
			case true:
				updateProperties(checkboxInput, true, false);
				break;
			case false:
				updateProperties(checkboxInput, false, false);
				break;
			default:
				updateProperties(checkboxInput, false, false, true);
		}
	}

	function nextCheckboxState() {
		if (isDisabled) return;

		switch (state) {
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

		sendUpdate();
		updateCheckbox();
	}
</script>

<div class="optional">
	<input bind:this={checkboxInput} on:click={nextCheckboxState} {id} type="checkbox" />
	<label for={id} class:disabled={isDisabled}>{label}</label>
</div>
<div class="label" class:disabled={isDisabled}>
	{#if state === 'user'}
		{userLabel}
	{:else if state === true && override !== 'disabled'}
		{onLabel}
	{:else}
		{offLabel}
	{/if}
</div>

<style>
	.optional {
		display: flex;
	}
</style>
