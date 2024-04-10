<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	import Overridable from './_overridable.svelte';
	
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { initState } from '$lib/util/dialog';

	export let label: string;
	export let id: string;
	export let overrideMessage: string;
	export let onLabel: string;
	export let offLabel: string;
	export let initialState: UserValue<boolean>;
	export let override: OptAvailable<boolean>;
	export let inheritValue: boolean;

	const dispatch = createEventDispatcher();
	let inheritFn: () => boolean;
	let checkbox: HTMLInputElement;

	let state: boolean = initState(override, initialState, inheritValue)
	let inherit: boolean = initialState === 'inherit';

	export function getState(): UserValue<boolean> {
		return inherit ? 'inherit' : state;
	}

	function sendUpdate() {
		if (override !== 'enabled') {
			return;
		}

		inherit = inheritFn();
		dispatch('updateForm', {});
	}

	function check() {
		state = checkbox.checked;
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
		<div class="label disabled">
			<input type="checkbox" disabled checked={override === true} />
			{#if override === true}
				({onLabel})
			{:else}
				({offLabel})
			{/if}
		</div>
	</div>
	<div slot="inherit">
		<div class="label disabled">
			<input type="checkbox" disabled checked={inheritValue} />
			{#if inheritValue}
				{onLabel}
			{:else}
				{offLabel}
			{/if}
		</div>
	</div>
	<div slot="value">
		<div>
			<input type="checkbox" on:change={check} bind:this={checkbox} checked={state} />
			<div class="label">
				{#if state === true}
					{onLabel}
				{:else}
					{offLabel}
				{/if}
			</div>
		</div>
	</div>
</Overridable>

<style>
	.label {
		display: inline;
	}
</style>
