<script lang="ts" generics="T">
	import type { closeFn, innerDialogComponent } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';

	export let data: T | undefined = undefined;
	export let closeCallback: closeFn<T>;
	export let content: innerDialogComponent<T>;
	let dialog: HTMLDialogElement;

	function handleSubmit(e: Event) {
		if (data !== undefined) closeCallback(data);
	}

	function handleClose(e: Event) {
		if (data !== undefined) closeCallback(data);
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
		<header>X</header>
		<div class="content">
			<svelte:component this={content} bind:data />
		</div>
		<footer>
			<button type="submit">Submit</button>
			<button type="button" on:click={handleClose}>Cancel</button>
		</footer>
	</form>
</dialog>

<style>
	dialog {
		border-radius: 2rem;
		border: 1px solid black;
		padding: 2rem 2rem 1.5rem;
	}

	::backdrop {
		backdrop-filter: blur(2px);
	}

	.content {
		padding: 0px 1rem;
	}

	footer {
		margin-top: 3rem;
		text-align: right;
	}

	button {
		padding: 0.3rem 0.4rem;
	}
</style>
