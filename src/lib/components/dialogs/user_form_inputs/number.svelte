<script lang="ts">
	import type { Config } from '$lib/config';
	import type { FormUserValue } from '$lib/forms';
	import { onMount } from 'svelte';

	export let config: Config;
	export let label: string;
	export let userLabel: string = config.lang.lessonConfigDialogUseUserSetting;
	export let initialState: FormUserValue<number>;
	export let defaultValue: number;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;

	let checkboxInput: HTMLInputElement;
	let numberInput: HTMLInputElement;

	let state: FormUserValue<number> = initialState;
	let value: number = Number.isInteger(state) ? (state as number) : defaultValue;

	onMount(() => {
		if (numberInput) numberInput.value = value.toString();
		updateCheckbox();
	});

	export function getData(): number | 'user' | undefined {
		return state === 'disabled' ? undefined : state;
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
			default:
				checkboxInput.checked = true;
				checkboxInput.indeterminate = false;
		}
	}

	function nextCheckboxState() {
		switch (state) {
			case 'disabled':
				break;
			case 'user':
				state = value;
				break;
			default:
				state = 'user';
		}

		updateCheckbox();
	}
</script>

<div class="optional">
	<input bind:this={checkboxInput} on:click={nextCheckboxState} id="until" type="checkbox" />
	<label for="until">{label}</label>
</div>
{#if state === 'user'}
	<div class="check-value">{userLabel}</div>
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
