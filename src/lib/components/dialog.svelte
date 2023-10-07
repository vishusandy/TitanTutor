<script lang="ts" generics="T">
	import type { Config } from '$lib/config';
	import type { closeFn, innerDialogComponent } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';

	export let passProps: any;
	export let config: Config;
	export let title: string = '';
	export let hasSubmit: boolean;
	export let closeCallback: closeFn<T>;
	export let content: innerDialogComponent;
	let dialog: HTMLDialogElement;

	function handleSubmit(e: Event) {
		closeCallback(submitData());
	}

	function handleClose(e: Event) {
		closeCallback(undefined);
	}

	onMount(() => {
		dialog.showModal();
	});

	onDestroy(() => {
		dialog.close();
	});

	let submitData: () => T | undefined;
</script>

<dialog bind:this={dialog}>
	<form on:submit|preventDefault={handleSubmit}>
		<div>
			<header>
				<button type="button" class="close-btn" on:click={handleClose} title={config.lang.close}>
					<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
						<path class="line" d="M 0 20 L 20 0" />
						<path class="line" d="M 0 0 L 20 20" />
					</svg>
				</button>
				<h1>{title}</h1>
			</header>
			<div class="content">
				{#if hasSubmit}
					<svelte:component this={content} bind:getData={submitData} bind:config {...passProps} />
				{:else}
					<svelte:component this={content} bind:config {...passProps} />
				{/if}
			</div>
			<footer>
				{#if hasSubmit}
					<button type="submit">{config.lang.submit}</button>
				{/if}
				<button type="button" on:click={handleClose}
					>{#if hasSubmit}{config.lang.cancel}{:else}{config.lang.close}{/if}</button
				>
			</footer>
		</div>
	</form>
</dialog>

<style>
	.close-btn {
		border: 0px;
		line-height: 0px;
		padding: 0.2rem;
		position: absolute;
		right: 0.7rem;
		top: 0.7rem;
		background-color: transparent;
	}

	.close-btn svg {
		width: 0.7rem;
		height: 0.7rem;
	}

	.line {
		stroke: #333;
		stroke-width: 0.2rem;
	}

	.close-btn:hover .line,
	.close-btn:focus-within .line {
		stroke: red;
	}

	.close-btn:active .line {
		stroke: #cc0000;
	}

	header {
		margin-bottom: 2.5rem;
		padding: 1rem 0px 0.6rem;
		text-align: center;
		background-color: #f5f5f5;
		position: sticky;
		top: 0px;
	}

	header h1 {
		margin: 0rem 1rem 0rem 1rem;
	}

	.content {
		padding: 0px 4rem;
	}

	footer {
		margin: 2rem 0rem 0rem 0rem;
		padding: 1rem 1.5rem 1.5rem 1.5rem;
		text-align: right;
		background-color: #f5f5f5;
	}

	footer button {
		font-weight: bold;
		font-size: 0.9rem;
	}

	dialog {
		border-radius: 0.5rem;
		border: 0px;
		padding: 0px;
		box-shadow: 3px 3px 10px #888;
	}

	::backdrop {
		backdrop-filter: blur(2px);
	}
</style>
