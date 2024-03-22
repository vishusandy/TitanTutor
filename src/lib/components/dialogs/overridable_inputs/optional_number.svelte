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
	export let nullLabel: string;
	export let initialState: UserValue<number | null>;
	export let defaultValue: number;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;
	export let override: OptAvailable<number | null>;
	export let inheritValue: number | null;

	const dispatch = createEventDispatcher();

	let checkboxInput: HTMLInputElement;
	let numberInput: HTMLInputElement;

	let state: UserValue<number | null> =
		override !== 'enabled' && override !== 'disabled' ? override : initialState;
	let value: number = Number.isInteger(state) ? (state as number) : defaultValue;

	let isDisabled = override !== 'enabled';
	$: isDisabled = override !== 'enabled';

	onMount(() => {
		if (numberInput) numberInput.value = value.toString();
		updateCheckbox();
	});

	export function getState(): UserValue<number | null> {
		return state;
	}

	function sendUpdate() {
		dispatch('updateForm', {});
	}

	function numberChanged() {
		value = parseInt(numberInput.value);
		state = value;
		sendUpdate();
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
			case null:
				updateCheckboxProperties(checkboxInput, false, false);
				break;
			default:
				updateCheckboxProperties(checkboxInput, true, false);
		}
	}

	function nextCheckboxState() {
		if (isDisabled) return;

		switch (state) {
			case null:
				state = 'inherit';
				break;
			case 'inherit':
				state = value;
				break;
			default:
				state = null;
		}

		sendUpdate();
		updateCheckbox();
	}
</script>

<div class="optional">
	<input
		disabled={isDisabled}
		bind:this={checkboxInput}
		on:click={nextCheckboxState}
		{id}
		type="checkbox"
	/>
	<label class:disabled={isDisabled} for={id}>{label}</label>
</div>
{#if override !== 'enabled'}
	<Override {overrideLabel} {overrideMessage}>
		{#if override === null}
			{nullLabel}
		{:else if override !== 'disabled'}
			<input type="number" disabled value={override} />
		{/if}
	</Override>
{:else if state === 'inherit'}
	<Inherit {inheritLabel}>
		{#if inheritValue !== null}
			<input title={inheritLabel} disabled type="number" value={inheritValue} />
		{:else}
			{nullLabel}
		{/if}
	</Inherit>
{:else if state === null}
	<div class="check-value valign" class:disabled={override !== 'enabled'}>{nullLabel}</div>
{:else if Number.isInteger(state)}
	<div class="check-value valign input">
		<input
			bind:this={numberInput}
			on:change={numberChanged}
			value={state}
			type="number"
			{min}
			{max}
			{step}
		/>
	</div>
{:else}
	<div>
		<input bind:this={numberInput} type="number" disabled />
	</div>
{/if}

<style>
	.optional {
		display: flex;
	}
</style>
