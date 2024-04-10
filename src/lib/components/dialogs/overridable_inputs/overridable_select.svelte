<script lang="ts" generics="T">
	import { createEventDispatcher } from 'svelte';
	
	import Overridable from './_overridable.svelte';
	
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { initState } from '$lib/util/dialog';

	export let label: string;
	export let id: string;
	export let overrideMessage: string;
	export let initialState: UserValue<T>;
	export let override: OptAvailable<T>;
	export let inheritValue: string; // key of the value to inherit
	export let choices: { key: string; label: string; value: T }[];

	const map = new Map(Array.from(choices.map(({ key, value }) => [key, value])));
	const rev = new Map(Array.from(choices.map(({ key, value }) => [value, key])));

	const dispatch = createEventDispatcher();
	let inheritFn: () => boolean;
	let selectBox: HTMLSelectElement;

	let state: T = initState(override, initialState, map.get(inheritValue) ?? choices[0].value);
	let inherit: boolean = initialState === 'inherit';

	let selected: string | undefined = undefined;
	if (initialState !== 'inherit') {
		selected = rev.get(initialState) ?? choices[0].key;
	} else if (initialState === 'inherit') {
		selected = map.has(inheritValue) ? inheritValue : choices[0].key;
	} else {
		selected = choices[0].key;
	}

	let overrideKey = '';
	if (override !== 'disabled' && override !== 'enabled') {
		overrideKey = rev.get(override) ?? choices[0].key;
	}

	export function getState(): UserValue<T> {
		return inherit ? 'inherit' : state;
	}

	function sendUpdate() {
		if (override !== 'enabled') {
			return;
		}

		inherit = inheritFn();
		dispatch('updateForm', {});
	}

	function selectChanged(e: Event) {
		let s = map.get(selectBox.value);

		if (s === undefined) {
			e.preventDefault();
			return;
		}

		selected = selectBox.value;
		state = s;
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
			<select disabled>
				{#each choices as { key, label } (key)}
					<option value={key} selected={overrideKey === key}>{label}</option>
				{/each}
			</select>
		</div>
	</div>
	<div slot="inherit">
		<div class="label disabled">
			<select disabled>
				{#each choices as { key, label } (key)}
					<option value={key} selected={inheritValue === key}>{label}</option>
				{/each}
			</select>
		</div>
	</div>
	<div slot="value">
		<div>
			<div class="label">
				<select bind:this={selectBox} on:change={selectChanged}>
					{#each choices as { key, label } (key)}
						<option value={key} selected={selected === key}>{label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</Overridable>

<style>
	.label {
		display: inline;
	}
</style>
