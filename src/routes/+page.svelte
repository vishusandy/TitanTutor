<script lang="ts">
	import Typing from '$lib/components/typing.svelte';
	import { Config } from '$lib/config';
	import { SessionStats } from '$lib/stats';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
    let config = Config.load();
	let lesson = data.lesson;
	let lessonOpts = data.lessonOpts;
	let sessionStats = new SessionStats();

	onMount(() => {
		document.documentElement.setAttribute('lang', config.translations.lang);
	});
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<Typing {config} {lesson} {lessonOpts} {sessionStats} />
