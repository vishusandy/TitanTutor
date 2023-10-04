<script lang="ts" generics="T">
	import type { Language } from '$lib/language';
	import type { closeFn, innerDialogComponent } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';

	export let lang: Language;
	export let formData: T | undefined = undefined;
	export let title: string = '';
	export let closeCallback: closeFn<T>;
	export let content: innerDialogComponent<T>;
	let dialog: HTMLDialogElement;

	function handleSubmit(e: Event) {
		if (formData !== undefined) closeCallback(formData);
	}

	function handleClose(e: Event) {
		if (formData !== undefined) closeCallback(undefined);
	}

	onMount(() => {
		dialog.showModal();
	});

	onDestroy(() => {
		dialog.close();
	});
</script>

<dialog bind:this={dialog}>
	<form on:submit|preventDefault={handleSubmit}>
		<header>
			<button type="button" class="close-btn" on:click={handleClose}>
				<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<path class="line" d="M 0 20 L 20 0" />
					<path class="line" d="M 0 0 L 20 20" />
				</svg>
			</button>
			<h1>{title}</h1>
		</header>
		<div class="content">
			<svelte:component this={content} bind:formData bind:lang />
		</div>
		<footer>
			<button type="submit">{lang.submit}</button>
			<button type="button" on:click={handleClose}>{lang.cancel}</button>
		</footer>
	</form>
</dialog>

<style>
	.close-btn {
		/* border-radius: 2rem; */
		/* border: 1px solid #c0c0c0; */
		border: 0px;
		line-height: 0px;
		padding: 0.5rem;
		position: absolute;
		right: 0.7rem;
		top: 0.7rem;
		/* box-shadow: 0px 0px 3px #b0b0b0; */
		background-color: transparent;
	}

	.close-btn svg {
		width: 0.7rem;
		height: 0.7rem;
	}

	.line {
		/* fill: #000; */
		stroke: #333;
		stroke-width: 0.2rem;
	}

	.close-btn:hover .line,
	.close-btn:focus-within .line {
		stroke: red;
	}

	header {
		padding: 2rem 0px 1rem;
		text-align: center;
		background-color: #f5f5f5;
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
		/* padding: 0px 1rem; */
		text-align: right;
		background-color: #f5f5f5;
	}

	dialog {
		border-radius: 0.5rem;
		border: 0px;
		/* padding: 0.8rem 1rem 1.5rem; */
		padding: 0px;
		box-shadow: 3px 3px 10px #888;
	}

	::backdrop {
		backdrop-filter: blur(2px);
	}
</style>
