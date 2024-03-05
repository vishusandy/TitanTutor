<script lang="ts">
	import '$lib/../styles/words.scss';
	import '$lib/../styles/global.scss';

	import type { PageData } from './$types';

	import Typing from '$lib/components/typing.svelte';
	import { LessonStats } from '$lib/stats';

	export let data: PageData;

	let db = data.db;
	let config = data.config;
	let lesson = data.lesson;
	let lessonOpts = data.lessonOpts;
	let sessionStats = new LessonStats(lesson.baseLesson().id, config.checkMode);
</script>

<svelte:head>
	<title>Keyboard Tutor</title>
</svelte:head>

<Typing originalConfig={config} {lesson} lessonStats={sessionStats} {db} {lessonOpts} />
