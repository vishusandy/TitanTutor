<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { SessionStats } from '$lib/stats';
	import { createStatsDialog } from '$lib/dialog';

	export let data: PageData;
	let config = data.config;
	let lesson = data.lesson;
	let lessonOpts = data.lessonOpts;
	let sessionStats = new SessionStats();

	onMount(() => {
		document.documentElement.setAttribute('lang', config.lang.lang);
	});

	async function showStatsDialog() {
		createStatsDialog(config, sessionStats).then(() => {});
	}
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<div class="tutor-bar">
	<button type="button" class="link" on:click={showStatsDialog}
		>{config.lang.openStatsDialog}</button
	>
</div>

<Typing {config} {lesson} {lessonOpts} {sessionStats} />

<style>
	.tutor-bar {
		display: flex;
		justify-content: center;
	}
</style>
