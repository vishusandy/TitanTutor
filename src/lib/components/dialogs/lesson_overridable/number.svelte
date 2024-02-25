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
	export let initialState: UserValue<number>;
	export let defaultValue: number;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;
	export let override: OptAvailable<number>;

	const dispatch = createEventDispatcher();

	let checkboxInput: HTMLInputElement;
	let numberInput: HTMLInputElement;

	let state: UserValue<number> =
		override !== 'enabled' && override !== 'disabled' ? override : initialState;
	if (override !== 'enabled' && override !== 'disabled') defaultValue = override;
	let value: number = Number.isInteger(state) ? (state as number) : defaultValue;

	let isDisabled = override !== 'enabled';
	$: isDisabled = override !== 'enabled';

	onMount(() => {
		if (numberInput) numberInput.value = value.toString();
		updateCheckbox();
	});

	export function getState(): UserValue<number> {
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
			case 'user':
				updateCheckboxProperties(checkboxInput, false, true);
				break;
			default:
				updateCheckboxProperties(checkboxInput, true, false);
		}
	}

	function nextCheckboxState() {
		if (isDisabled) return;

		switch (state) {
			case 'user':
				state = value;
				break;
			default:
				state = 'user';
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
{#if state === 'user'}
	<div class="label check-value">{userLabel}</div>
{:else if Number.isInteger(state)}
	<div class="check-value input">
		<input
			disabled={override !== 'enabled'}
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
