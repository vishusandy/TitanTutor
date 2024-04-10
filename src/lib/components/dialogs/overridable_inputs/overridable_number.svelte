<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	import Overridable from './_overridable.svelte';
	
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { initState } from '$lib/util/dialog';

	export let label: string;
	export let id: string;
	export let overrideMessage: string;
	export let initialState: UserValue<number>;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = 1;
	export let override: OptAvailable<number>;
	export let inheritValue: number;

	const dispatch = createEventDispatcher();
	let inheritFn: () => boolean;
	let numberInput: HTMLInputElement;

	let state: number = initState(override, initialState, inheritValue);
	let inherit: boolean = initialState === 'inherit';

	export function getState(): UserValue<number> {
		return inherit ? 'inherit' : state;
	}

	function sendUpdate() {
		if (override !== 'enabled') {
			return;
		}

		inherit = inheritFn();
		dispatch('updateForm', {});
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
	</div>
</Overridable>

<style>
	.label {
		display: inline;
	}
</style>
