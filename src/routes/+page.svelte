<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { SessionStats } from '$lib/stats';

	export let data: PageData;
	let config = data.config;
	let lesson = data.lesson;
	let lessonOpts = data.lessonOpts;
	let sessionStats = new SessionStats();

	onMount(() => {
		document.documentElement.setAttribute('lang', data.config.lang.lang);
	});
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<Typing {config} {lesson} {lessonOpts} {sessionStats} />
