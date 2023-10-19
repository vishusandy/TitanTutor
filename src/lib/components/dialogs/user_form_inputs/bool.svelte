<script lang="ts">
	import type { Config } from '$lib/config';
	import type { FormUserValue } from '$lib/forms';
	import { onMount } from 'svelte';

	export let config: Config;
	export let label: string;
	export let userLabel: string = config.lang.lessonConfigDialogUseUserSetting;
	export let onLabel: string = config.lang.on;
	export let offLabel: string = config.lang.off;
	export let initialState: FormUserValue<boolean>;

	let checkboxInput: HTMLInputElement;

	let state: FormUserValue<boolean> = initialState;

	onMount(() => {
		updateCheckbox();
	});

	export function getData(): boolean | 'user' | undefined {
		return state === 'disabled' ? undefined : state;
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
			case true:
				checkboxInput.checked = true;
				checkboxInput.indeterminate = false;
				break;
			case false:
				checkboxInput.checked = false;
				checkboxInput.indeterminate = false;
				break;
		}
	}

	function nextCheckboxState() {
		switch (state) {
			case 'disabled':
				break;
			case 'user':
				state = true;
				break;
			case true:
				state = false;
				break;
			case false:
				state = 'user';
				break;
		}

		updateCheckbox();
	}
</script>

<div class="optional">
	<input bind:this={checkboxInput} on:click={nextCheckboxState} id="until" type="checkbox" />
	<label for="until">{label}</label>
</div>
<div>
	{#if state === 'user'}
		{userLabel}
	{:else if state === true}
		{onLabel}
	{:else}
		{offLabel}
	{/if}
</div>

<style>
	.optional {
		display: flex;
	}
</style>
