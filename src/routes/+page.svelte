<script lang="ts">
	import '$lib/../styles/words.scss';
	import '$lib/../styles/global.scss';

	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { SessionStats } from '$lib/stats';

	export let data: PageData;

	let config = data.config;
	let lesson = data.lesson;
	let sessionStats = new SessionStats(config.checkMode);
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<Typing {config} {lesson} {sessionStats} />
