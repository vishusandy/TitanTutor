<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { Config } from '$lib/config';
	import { SessionStats } from '$lib/stats';

	export let data: PageData;
	let lang = data.lang;
	let kbmap = data.kbmap;
	let config = Config.load();
	let lesson = data.lesson;
	let lessonOpts = data.lessonOpts;
	let sessionStats = new SessionStats();

	onMount(() => {
		document.documentElement.setAttribute('lang', data.lang.lang);
	});
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<Typing {config} {kbmap} {lesson} {lessonOpts} {sessionStats} {lang} />
