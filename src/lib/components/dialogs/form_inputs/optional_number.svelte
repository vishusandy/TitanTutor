<script lang="ts">
	import type { Config } from '$lib/types/config';
	import { onMount } from 'svelte';

	export let config: Config;
	export let label: string;
	export let id: string;
	export let nullLabel: string = config.lang.none;
	export let initialState: number | null;
	export let defaultValue: number;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;

	let checkboxInput: HTMLInputElement;
	let numberInput: HTMLInputElement;

	let state: number | null = initialState;
	let value: number = Number.isInteger(state) ? (state as number) : defaultValue;

	onMount(() => {
		if (numberInput) numberInput.value = value.toString();
		updateCheckbox();
	});

	export function getData(): number | null {
		return state;
	}

	function numberChanged() {
		value = parseInt(numberInput.value);
		state = value;
	}

	function updateCheckbox() {
		switch (state) {
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
		switch (state) {
			case null:
				state = value;
				break;
			default:
				state = null;
		}
		updateCheckbox();
	}
</script>

<div class="optional">
	<label for={id}>{label}</label>
</div>
<div class="check-value" class:input={state !== null}>
	<input bind:this={checkboxInput} on:click={nextCheckboxState} {id} type="checkbox" />
	{#if state === null}
		{nullLabel}
	{:else}
		<input
			bind:this={numberInput}
			on:change={numberChanged}
			value={state}
			type="number"
			{min}
			{max}
			{step}
		/>
	{/if}
</div>

<style>
	.optional {
		display: flex;
	}
</style>
