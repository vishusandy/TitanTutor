<script lang="ts">
	import '$lib/../styles/words.scss';
	import '$lib/../styles/global.scss';

	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { LessonStats } from '$lib/stats';
	import { onMount } from 'svelte';

	export let data: PageData;

	let db = data.db;
	let config = data.config;
	let lesson = data.lesson;
	let lessonOpts = data.lessonOpts;
	let sessionStats = new LessonStats(lesson.baseLesson().id, config.checkMode);

	onMount(() => {
		document.documentElement.lang = config.lang.lang;
		document.documentElement.dir = config.lang.textDirection;
	});
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<Typing originalConfig={config} {lesson} lessonStats={sessionStats} {db} {lessonOpts} />
