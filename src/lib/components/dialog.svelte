<script lang="ts" generics="T">
	import { onDestroy, onMount } from 'svelte';

	import Close from './imgs/close.svelte';

	import type { Config } from '$lib/config';
	import type { CloseFn, InnerDialogComponent } from '$lib/types/types';

	export let title: string;
	export let passProps: any;
	export let config: Config;
	export let db: IDBDatabase | undefined;
	export let hasSubmit: boolean;
	export let closeCallback: CloseFn<T>;
	export let content: InnerDialogComponent;
	export let closeLabel = config.lang.close;
	export let submitLabel = config.lang.submit;
	export let cancelLabel = config.lang.cancel;
	export let confirmPrompt: string | undefined = undefined;

	const closeTime: number = 100.0;

	let dialog: HTMLDialogElement;
	let closeButton: HTMLButtonElement;
	let submitButton: HTMLButtonElement | undefined = undefined;

	onMount(() => {
		if (closeButton !== undefined) {
			setTimeout(() => {
				closeButton.focus();
			}, 1);
		}
	});
	function animateClose() {
		dialog.classList.add('closing');
	}

	function handleSubmit(e: Event) {
		if ('submitter' in e && e.submitter !== submitButton) {
			return;
		}

		if (confirmPrompt === undefined || window.confirm(confirmPrompt)) {
			animateClose();
			setTimeout(() => closeCallback(submitData()), closeTime);
		}
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
				<button type="button" class="close-btn" on:click={handleClose} title={config.lang.close}>
					<Close />
				</button>
			</header>
		</div>
		<div class="content">
			{#if hasSubmit}
				<svelte:component this={content} bind:getData={submitData} bind:config bind:db {...passProps} />
			{:else}
				<svelte:component this={content} bind:config bind:db {...passProps} />
			{/if}
		</div>
		<div>
			<footer>
				{#if hasSubmit}
					<button type="submit" bind:this={submitButton}>{submitLabel}</button>
				{/if}
				<button type="button" id="dialog-close" class="close" on:click={handleClose} bind:this={closeButton}
					>{#if hasSubmit}{cancelLabel}{:else}{closeLabel}{/if}</button
				>
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
		min-height: 13rem;
		/* max-width: 98vw; */
		/* height: 100%; */
		display: grid;
		/* grid-template-areas: 'header', 'content', 'footer'; */
		grid-template-rows: max-content 1fr max-content;
		grid-template-columns: auto;
		/* grid-template-columns: 1fr; */
	}

	form {
		display: contents;
	}

	header {
		/* grid-area: header; */
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

	.content {
		/* grid-area: content; */
		padding: 0px 3rem;
		margin: 1rem 0px;
		overflow: auto;
	}

	footer {
		/* grid-area: footer; */
		margin: 0rem 0rem 0rem 0rem;
		padding: 0.8rem 1rem 0.8rem 1rem;
		text-align: right;
		background-color: var(--header-footer-color);
		border-top: 1px solid var(--form-border-inner-color);
		position: sticky;
		bottom: 0px;
	}

	footer button {
		font-size: 0.9rem;
		margin: 0.1rem 0.3rem;
	}

	.close-btn {
		border: 0px;
		line-height: 0px;
		padding: 0.2rem;
		width: 1.5rem;
		height: 1.5rem;
		margin: 0px 0.3rem;
	}

	:global(dialog .dialog-grid) {
		display: grid;
		margin: 1rem auto;
		/* width: min-content; */
		column-gap: 3rem;
		row-gap: 1.4rem;
	}

	:global(.close-btn svg) {
		stroke: #777;
		fill: none;
		stroke-width: 2;
	}

	:global(.close-btn svg line) {
		vector-effect: non-scaling-stroke;
	}

	:global(.close-btn:hover svg, .close-btn:focus svg) {
		stroke: #444;
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
