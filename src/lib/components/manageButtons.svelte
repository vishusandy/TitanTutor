<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Close from '$lib/components/imgs/close.svelte';
	import Pencil2 from '$lib/components/imgs/pencil2.svelte';
	import Cog from '$lib/components/imgs/cog.svelte';
	import Cog2 from '$lib/components/imgs/cog2.svelte';
	import Stats from '$lib/components/imgs/stats.svelte';
	import Reset from '$lib/components/imgs/reset.svelte';

	import { Config, loadUserConfig } from '$lib/config';
	import { showEditLessonDialog, showLessonConfigDialog, showLessonStatsLog } from '$lib/util/dialog';
	import { remove, addUpdate, user_lessons_store, get, lesson_opts_store, lesson_stats_store } from '$lib/db';
	import { loadUserLesson, type UserWordList } from '$lib/lessons/base/user_wordlist';
	import type { LessonTypingConfig, StorableBaseLesson, StoredOverrides } from '$lib/types/lessons';
	import { Lesson } from '$lib/lessons/lesson';
	import type { StatsLog } from '$lib/stats';

	export let config: Config;
	export let lesson: StorableBaseLesson;
	export let db: IDBDatabase;
	export let custom: boolean;
	export let stats: StatsLog | undefined;
	const dispatch = createEventDispatcher();

	let statsAlt = stats ? config.lang.openUserStatsDialog : config.lang.statsLogNoStats;

	async function editLesson() {
		if (!lesson.id.startsWith('user_')) {
			return;
		}

		const l: UserWordList = (await loadUserLesson(config, db, lesson.id)) as UserWordList;
		const storable = await showEditLessonDialog(config, db, l);

		if (storable === undefined) {
			return;
		}

		addUpdate(db, user_lessons_store, storable);
		dispatch('updated', { edited: lesson.id });
	}

	async function deleteLesson() {
		if (
			!lesson.id.startsWith('user_') ||
			!window.confirm(config.lang.lessonDialogConfirmDelete.replace('%s', lesson.name))
		) {
			return;
		}

		const c = await loadUserConfig(db);
		if (c.lastLesson === lesson.id) {
			c.lastLesson = null;
			c.saveUserConfig(db);
		}

		config = c;
		remove(db, user_lessons_store, lesson.id);
		dispatch('updated', { deleted: lesson.id });
	}

	async function editSettings() {
		const les = await Lesson.load(lesson.id, config, db);
		let lessonOpts = await get<StoredOverrides>(db, lesson_opts_store, lesson.id);
		let id: string,
			res: Partial<LessonTypingConfig> = {};
		if (lessonOpts !== undefined) {
			({ id, ...res } = lessonOpts);
		}
		const result = await showLessonConfigDialog(config, db, les, res, undefined);
		if (result !== undefined) {
			let lessonOptions: Partial<LessonTypingConfig> = result[1];
			Lesson.saveLessonOptions(lesson.id, lessonOptions, db);
			addUpdate(db, lesson_opts_store, { lesson_id: lesson.id, ...result[1] });
		}
	}

	async function showLessonStatsDialog() {
		if (stats) {
			showLessonStatsLog(config, db, lesson.name, stats);
		}
	}

	async function resetStats() {
		if (stats !== undefined && window.confirm(config.lang.resetLessonStatsPrompt.replace('%s', lesson.name))) {
			await remove(db, lesson_stats_store, stats.lesson_id);
			stats = undefined;
		}
	}
</script>

<div class="buttons">
	{#if custom}
		<button class="remove-btn icon" on:click={() => deleteLesson()} title={config.lang.delete}><Close /></button>
	{/if}
	<button class="reset-btn icon" on:click={resetStats} disabled={stats === undefined} title={config.lang.resetLessonStats}>
		<Reset />
	</button>
	<button disabled={stats === undefined} on:click={showLessonStatsDialog} class="stats-btn icon" title={statsAlt}
		><Stats /></button
	>
	<button class="settings-btn icon" on:click={() => editSettings()} title={config.lang.openLessonConfigDialog}>
		<Cog2 />
	</button>
	{#if custom}
		<button class="edit-btn icon" on:click={() => editLesson()} title={config.lang.edit}><Pencil2 /></button>
	{/if}
</div>

<style>
	.buttons {
		display: flex;
		align-items: center;
		/* flex-wrap: wrap; */
	}

	.icon {
		width: 1.8rem;
		height: 1.8rem;
	}

	.remove-btn {
		padding: 0.35rem;
	}

	.settings-btn {
		width: 1.8rem;
		height: 1.8rem;
	}

	.edit-btn {
		width: 1.6rem;
		height: 1.6rem;
	}

	.reset-btn {
		--stroke: #000;
	}
	.reset-btn:disabled {
		--stroke: #aaa;
	}

	:global(.start-btn svg polygon) {
		fill: rgb(123, 206, 39);
		stroke: #000;
		vector-effect: non-scaling-stroke;
		stroke-width: 1;
	}

	:global(.remove-btn svg line) {
		stroke: #af2222;
		fill: none;
		stroke-width: 2.2;
		vector-effect: non-scaling-stroke;
	}

	:global(.reset-btn:not(:disabled) svg path) {
		stroke: #2e8ea6;
	}

	:global(.reset-btn:disabled svg path) {
		stroke: #aaa;
	}

	:global(.settings-btn svg path) {
		vector-effect: non-scaling-stroke;
		stroke-width: 1.4;
	}

	:global(.settings-btn svg) {
		fill: #b1dce7;
		stroke: #005469 !important;
	}

	:global(.settings-btn:hover svg) {
		stroke: #002a35 !important;
	}
</style>
