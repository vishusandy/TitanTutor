<script lang="ts">
	import type { Language } from '$lib/data/language';
	import type { SessionStats } from '$lib/stats';
	import { formatDuration } from '$lib/util/util';

	export let stats: SessionStats;
	export let lang: Language;
	let time: number = 0;

	setInterval(() => {
		if (stats.started !== undefined) {
			time = Math.round(stats.duration + performance.now() - stats.started);
		}
	}, 1000);
</script>

<div>{lang.statsDialogDuration}</div>
<div><time datetime="{time}ms">{formatDuration(time, lang)}</time></div>

<style>
	div:first-of-type {
		margin-right: 1rem;
	}
</style>
