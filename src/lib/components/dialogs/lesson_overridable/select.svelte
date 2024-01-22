<script lang="ts" generics="T">
	import type { Config } from '$lib/types/config';
	import type { FormUserValue, OptAvailable } from '$lib/types/forms';
	import { updateProperties } from '$lib/util/dom';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let config: Config;
	export let id: string;
	export let label: string;
	export let userLabel: string = config.lang.useUserValue;
	export let choices: { key: string; label: string; value: T }[];
	export let initialValue: FormUserValue<T>;
	export let override: OptAvailable<T>;

	const dispatch = createEventDispatcher();

	let checkboxInput: HTMLInputElement | undefined;
	let selectInput: HTMLSelectElement | undefined;

	if (override !== 'disabled' && override !== 'enabled') {
		initialValue = override;
	}

	let state = override !== 'enabled' ? override : initialValue;

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

	export function getState(): FormUserValue<T> {
		return state;
	}

	function sendUpdate() {
		dispatch('updateForm', {});
	}

	function updateCheckbox() {
		if (checkboxInput === undefined) return;

		if (isDisabled) {
			updateProperties(checkboxInput, false, false, true);
			return;
		}

		switch (state) {
			case 'disabled':
				updateProperties(checkboxInput, false, false, true);
				break;
			case 'user':
				updateProperties(checkboxInput, false, true);
				break;
			default:
				updateProperties(checkboxInput, true, false);
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
			return;
		}
		e.preventDefault();
		sendUpdate();
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
{:else}
	<select disabled={isDisabled} bind:this={selectInput} on:change={selectChanged}>
		{#each choices as { key, label } (key)}
			<option value={key} selected={selected === key}>{label}</option>
		{/each}
	</select>
{/if}

<style>
	.optional {
		display: flex;
	}
</style>
