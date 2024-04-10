<script lang="ts">
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { updateCheckboxProperties } from '$lib/util/dom';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import Inherit from './_inherit.svelte';
	import Override from './_override.svelte';

	export let label: string;
	export let id: string;
	export let inheritLabel: string;
	export let overrideLabel: string;
	export let overrideMessage: string;
	export let onLabel: string;
	export let offLabel: string;
	export let initialState: UserValue<boolean>;
	export let override: OptAvailable<boolean>;
	export let inheritValue: boolean;

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
			case 'inherit':
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
			case 'inherit':
				state = true;
				break;
			case true:
				state = false;
				break;
			case false:
				state = 'inherit';
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
{#if override !== 'enabled'}
	<Override {overrideLabel} {overrideMessage}>
		{#if override === true}
			({onLabel})
		{:else}
			({offLabel})
		{/if}
	</Override>
{:else if state === 'inherit'}
	<Inherit {inheritLabel}>
		{#if inheritValue}
			{onLabel}
		{:else}
			{offLabel}
		{/if}
	</Inherit>
{:else}
	<div class="label">
		{#if state === true}
			{onLabel}
		{:else}
			{offLabel}
		{/if}
	</div>
{/if}

<style>
	.optional {
		display: flex;
	}
</style>
