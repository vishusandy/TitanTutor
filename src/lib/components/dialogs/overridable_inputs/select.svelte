<script lang="ts" generics="T">
	import type { Config } from '$lib/config';
	import type { OptAvailable, UserValue } from '$lib/types/forms';
	import { updateCheckboxProperties } from '$lib/util/dom';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let config: Config;
	export let id: string;
	export let label: string;
	export let userLabel: string = config.lang.useUserValue;
	export let choices: { key: string; label: string; value: T }[];
	export let initialValue: UserValue<T>;
	export let override: OptAvailable<T>;
	export let inheritValue: string;

	const dispatch = createEventDispatcher();

	let checkboxInput: HTMLInputElement | undefined;
	let selectInput: HTMLSelectElement | undefined;

	if (override !== 'disabled' && override !== 'enabled') {
		initialValue = override;
	}

	let state = override !== 'enabled' && override !== 'disabled' ? override : initialValue;

	let isDisabled = override !== 'enabled' || state === 'disabled';
	$: isDisabled = override !== 'enabled' || state === 'disabled';

	const map = new Map(Array.from(choices.map(({ key, value }) => [key, value])));
	const rev = new Map(Array.from(choices.map(({ key, value }) => [value, key])));

	let selected: string | undefined = undefined;
	if (initialValue !== 'user' && initialValue !== 'disabled') {
		selected = rev.get(initialValue) ?? choices[0].key;
	}

	onMount(() => {
		updateCheckbox();
	});

	export function getState(): UserValue<T> {
		return state;
	}

	function sendUpdate() {
		dispatch('updateForm', {});
	}

	function updateCheckbox() {
		if (checkboxInput === undefined) return;

		if (isDisabled) {
			updateCheckboxProperties(checkboxInput, false, false, true);
			return;
		}

		switch (state) {
			case 'disabled':
				updateCheckboxProperties(checkboxInput, false, false, true);
				break;
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
				const v = choices.find((s) => s.key === selected) ?? choices[0];
				state = v.value;
				break;
			default:
				state = 'user';
		}

		sendUpdate();
		updateCheckbox();
	}

	function selectChanged(e: Event) {
		if (selectInput !== undefined && map.has(selectInput.value)) {
			state = map.get(selectInput.value)!;
			selected = selectInput.value;
			sendUpdate();
			return;
		}
		e.preventDefault();
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
	<select disabled title={userLabel}>
		{#each choices as { key, label } (key)}
			<option value={key} selected={inheritValue === key}>{label}</option>
		{/each}
	</select>
{:else}
	<select disabled={isDisabled} bind:this={selectInput} on:change={selectChanged}>
		{#each choices as { key, label } (key)}
			<option value={key} selected={selected === key}>{label}</option>
		{/each}
	</select>
{/if}

<style>
	select {
		width: min-content;
	}
	.optional {
		display: flex;
	}
</style>
