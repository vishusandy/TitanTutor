<script lang="ts">
	import type { Config } from '$lib/types/config';
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { updateCheckboxProperties } from '$lib/util/dom';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let config: Config;
	export let label: string;
	export let id: string;
	export let userLabel: string = config.lang.useUserValue;
	export let onLabel: string = config.lang.on;
	export let offLabel: string = config.lang.off;
	export let initialState: UserValue<boolean>;
	export let override: OptAvailable<boolean>;

	const dispatch = createEventDispatcher();
	let checkboxInput: HTMLInputElement;

	let state: UserValue<boolean> =
		override !== 'enabled' && override !== 'disabled' ? override : initialState;
	$: state = override !== 'enabled' && override !== 'disabled' ? override : state;
	let isDisabled: boolean = override !== 'enabled';
	$: {
		isDisabled = override !== 'enabled';
		if (checkboxInput) updateCheckbox();
	}

	onMount(() => {
		updateCheckbox();
	});

	export function getState(): UserValue<boolean> {
		return state;
	}

	function sendUpdate() {
		dispatch('updateForm', {});
	}

	function updateCheckbox() {
		if (isDisabled) {
			updateCheckboxProperties(checkboxInput, false, false, true);
			return;
		}

		switch (state) {
			case 'user':
				updateCheckboxProperties(checkboxInput, false, true);
				break;
			case true:
				updateCheckboxProperties(checkboxInput, true, false);
				break;
			case false:
				updateCheckboxProperties(checkboxInput, false, false);
				break;
			default:
				updateCheckboxProperties(checkboxInput, false, false, true);
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
				override = 'disabled';
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
