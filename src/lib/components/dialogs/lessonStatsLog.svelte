<script lang="ts">
	import type { Config } from '$lib/config';
	import type { StatsLog, BaseStats } from '$lib/stats';
	import { formatDuration } from '$lib/util/util';

	export let config: Config;
	export let db: IDBDatabase;
	export let stats: StatsLog;
	export let lesson_id: string;
	export let lesson_name: string;
</script>
hi
<style>
	.dialog-grid {
		display: grid;
		grid-template-columns: min-content auto;
		column-gap: 2rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		width: min-content;
	}
</style>
