<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	import Overridable from './_overridable.svelte';
	
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { initState } from '$lib/util/dialog';

	export let label: string;
	export let id: string;
	export let overrideMessage: string;
	export let initialState: UserValue<number | null>;
	export let nullLabel: string;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;
	export let override: OptAvailable<number | null>;
	export let inheritValue: number | null;

	const dispatch = createEventDispatcher();
	let inheritFn: () => boolean;
	let numberInput: HTMLInputElement;
	let checkbox: HTMLInputElement;

	let state: number | null = initState(override, initialState, inheritValue);
	let inherit: boolean = initialState === 'inherit';
	let checked: boolean = state !== null;

	export function getState(): UserValue<number | null> {
		return inherit ? 'inherit' : state;
	}

	function sendUpdate() {
		if (override !== 'enabled') {
			return;
		}

		inherit = inheritFn();
		dispatch('updateForm', {});
	}

	function nullChanged() {
		if (checkbox.checked) {
			state = inheritValue;
		} else {
			state = null;
		}
		sendUpdate();
	}

	function numberChanged() {
		state = parseInt(numberInput.value);
		sendUpdate();
	}
</script>

<Overridable
	on:inheritUpdate={sendUpdate}
	{label}
	{id}
	bind:inherit
	{override}
	{overrideMessage}
	bind:getState={inheritFn}
>
	<div slot="override">
		<input type="number" disabled value={override} />
	</div>
	<div slot="inherit">
		<div class="label disabled">
			<input type="number" disabled value={inheritValue} />
		</div>
	</div>
	<div slot="value">
		<div>
			<input type="checkbox" {checked} on:change={nullChanged} bind:this={checkbox} />
			{#if state === null}
				<div class="label">{nullLabel}</div>
			{:else}
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
			{/if}
		</div>
	</div>
</Overridable>

<style>
	.label {
		display: inline;
	}
</style>
