<script lang="ts">
	import type { Language } from '$lib/data/language';
	import type { LessonStats } from '$lib/stats';
	import { formatDuration } from '$lib/util/lang';
	import { getPluralStrs } from '$lib/util/lang';

	export let stats: LessonStats;
	export let lang: Language;
	let time: number = 0;

	let plurals = getPluralStrs(lang);

	setInterval(() => {
		if (stats.started !== undefined) {
			time = Math.round(stats.duration + performance.now() - stats.started);
		}
	}, 1000);
</script>

<div>{lang.statsDialogDuration}</div>
<div><time datetime="{time}ms">{formatDuration(plurals, time)}</time></div>

<style>
	div:first-of-type {
		margin-right: 1rem;
	}
</style>
