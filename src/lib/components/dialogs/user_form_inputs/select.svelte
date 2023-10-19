<script lang="ts" generics="T">
	import type { Config } from '$lib/config';
	import type { FormUserValue, FormUserValueReturn } from '$lib/forms';
	import { onMount } from 'svelte';

	export let config: Config;
	export let id: string;
	export let label: string;
	export let userLabel: string = config.lang.useUserValue;
	export let choices: { key: string; label: string; value: T }[];
	export let initialValue: FormUserValue<T>;

	let checkboxInput: HTMLInputElement | undefined;
	let selectInput: HTMLSelectElement | undefined;

	let state = initialValue;

	const map = new Map(Array.from(choices.map(({ key, value }) => [key, value])));
	const rev = new Map(Array.from(choices.map(({ key, value }) => [value, key])));

	let selected: string | undefined = undefined;
	if (initialValue !== 'user' && initialValue !== 'disabled') {
		selected = rev.get(initialValue) ?? choices[0].key;
	}

	onMount(() => {
		updateCheckbox();
	});

	export function getData(): FormUserValueReturn<T> {
		return state === 'disabled' || state === 'user' ? undefined : state;
	}

	function updateCheckbox() {
		if (checkboxInput === undefined) return;

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
				const v = choices.find((s) => s.key === selected) ?? choices[0];
				state = v.value;
				break;
			default:
				state = 'user';
		}

		updateCheckbox();
	}

	function selectChanged() {
		if (selectInput !== undefined) selected = selectInput.value;
	}
</script>

<div class="optional">
	<input bind:this={checkboxInput} on:click={nextCheckboxState} {id} type="checkbox" />
	<label for={id}>{label}</label>
</div>
{#if state === 'user'}
	<div class="check-value">{userLabel}</div>
{:else}
	<select on:change={selectChanged}>
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
