<script lang="ts" generics="T">
	import { onDestroy, onMount } from 'svelte';

	import type { Config } from '$lib/config';
	import type { CloseFn, InnerDialogComponent } from '$lib/types';

	export let title: string;
	export let passProps: any;
	export let config: Config;
	export let hasSubmit: boolean;
	export let closeCallback: CloseFn<T>;
	export let content: InnerDialogComponent;
	export let closeLabel = config.lang.close;
	export let submitLabel = config.lang.submit;
	export let cancelLabel = config.lang.cancel;

	const closeTime: number = 100.0;

	let dialog: HTMLDialogElement;

	function animateClose() {
		dialog.classList.add('closing');
	}

	function handleSubmit(e: Event) {
		animateClose();
		setTimeout(() => closeCallback(submitData()), closeTime);
	}

	function handleClose(e: Event) {
		animateClose();
		setTimeout(() => closeCallback(undefined), closeTime);
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
				<h1>{title}</h1>
				<button type="button" class="close-btn" on:click={handleClose} title={config.lang.close} />
			</header>
			<div class="content">
				{#if hasSubmit}
					<svelte:component this={content} bind:getData={submitData} bind:config {...passProps} />
				{:else}
					<svelte:component this={content} bind:config {...passProps} />
				{/if}
			</div>
			<footer>
				<button type="button" class="close" on:click={handleClose}
					>{#if hasSubmit}{cancelLabel}{:else}{closeLabel}{/if}</button
				>
				{#if hasSubmit}
					<button type="submit">{submitLabel}</button>
				{/if}
			</footer>
		</div>
	</form>
</dialog>

<style>
	dialog {
		--border-color: var(--form-border-color);
		--header-footer-color: #f0f0f5;
		background-color: #f7f9fa;
		border-radius: 0.5rem;
		border: 1px solid var(--border-color);
		padding: 0px;
		box-shadow: 0px 0px 15px #939596;
		animation: dialog-slide-in 0.2s ease-out 0s 1;
	}

	header {
		font-family: var(--font-title);
		padding: 1rem 1rem 1rem 1rem;
		text-align: center;
		background-color: var(--header-footer-color);
		position: sticky;
		top: 0px;
		display: grid;
		grid-template-columns: 1fr auto;
		justify-items: center;
		align-items: center;
		border-bottom: 1px solid var(--form-border-inner-color);
	}

	header h1 {
		margin: 0px 2rem;
		font-size: 1.3rem;
		font-weight: normal;
		user-select: none;
	}

	.close-btn {
		border: 0px;
		line-height: 0px;
		padding: 0.2rem;
		width: 0.8rem;
		height: 0.8rem;
		background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
	}

	.content {
		padding: 2rem 3rem;
	}

	footer {
		margin: 0rem 0rem 0rem 0rem;
		padding: 0.8rem 1rem 0.8rem 1rem;
		text-align: right;
		background-color: var(--header-footer-color);
		border-top: 1px solid var(--form-border-inner-color);
	}

	footer button {
		font-size: 0.9rem;
	}

	::backdrop {
		backdrop-filter: blur(3px);
	}

	@keyframes dialog-slide-in {
		0% {
			opacity: 0;
		}
	}
</style>
