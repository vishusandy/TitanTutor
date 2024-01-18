<script lang="ts">
	import type { Config } from '$lib/types/config';
	import type { FormUserValue, FormUserValueReturn, OptAvailable } from '$lib/types/forms';
	import { onMount } from 'svelte';

	export let config: Config;
	export let label: string;
	export let id: string;
	export let userLabel: string = config.lang.useUserValue;
	export let nullLabel: string = config.lang.none;
	export let initialState: FormUserValue<number | null>;
	export let defaultValue: number;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;
	export let override: OptAvailable<number | null>;

	let checkboxInput: HTMLInputElement;
	let numberInput: HTMLInputElement;

	let state: FormUserValue<number | null> = override !== 'enabled' ? override : initialState;
	let value: number = Number.isInteger(state) ? (state as number) : defaultValue;

	onMount(() => {
		if (numberInput) numberInput.value = value.toString();
		updateCheckbox();
	});

	export function getData(): FormUserValueReturn<number | null> {
		return state === 'disabled' || state === 'user' ? undefined : state;
	}

	function numberChanged() {
		value = parseInt(numberInput.value);
		state = value;
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
			case null:
				checkboxInput.checked = false;
				checkboxInput.indeterminate = false;
				break;
			default:
				checkboxInput.checked = true;
				checkboxInput.indeterminate = false;
		}
	}

	function nextCheckboxState() {
		if (override !== 'enabled') return;

		switch (state) {
			case 'disabled':
				break;
			case null:
				state = 'user';
				break;
			case 'user':
				state = value;
				break;
			default:
				state = null;
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
	<label class:disabled={override !== 'enabled' || state === 'disabled'} for={id}>{label}</label>
</div>
{#if state === 'user'}
	<div class="check-value">{userLabel}</div>
{:else if state === null}
	<div class="label check-value" class:disabled={override !== 'enabled'}>{nullLabel}</div>
{:else if Number.isInteger(state)}
	<div class="check-value input">
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
