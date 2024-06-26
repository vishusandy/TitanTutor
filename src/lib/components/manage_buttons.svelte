<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Close from '$lib/components/imgs/close.svelte';
	import Pencil2 from '$lib/components/imgs/pencil.svelte';
	import Cog2 from '$lib/components/imgs/cog_small.svelte';
	import Stats from '$lib/components/imgs/stats.svelte';
	import Reset from '$lib/components/imgs/reset.svelte';
	import Start from '$lib/components/imgs/start.svelte';

	import { Config, loadUserConfig } from '$lib/config';
	import { showEditLessonDialog, showLessonConfigDialog, showLessonStatsLog } from '$lib/util/dialog';
	import { remove, addUpdate, user_lessons_store, get, lesson_opts_store, lesson_stats_store } from '$lib/db';
	import { loadUserLesson, type UserWordList } from '$lib/lessons/base/user_wordlist';
	import type { LessonTypingConfig, StorableBaseLesson, StoredOverrides } from '$lib/types/lessons';
	import { Lesson } from '$lib/lessons/lesson';
	import type { StatsLog } from '$lib/stats';
	import { home } from '$lib/util/nav';

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

	async function startLesson() {
		if (window.confirm(config.lang.lessonDialogStartLesson.replace('%s', lesson.name))) {
			const c = await loadUserConfig(db);
			c.lastLesson = lesson.id;
			c.saveUserConfig(db);
			home();
		}
	}
</script>

<div class="buttons">
	{#if custom}
		<button class="remove-btn icon" on:click={() => deleteLesson()} title={config.lang.delete}><Close /></button>
	{/if}
	<button
		class="reset-btn icon"
		on:click={resetStats}
		disabled={stats === undefined}
		title={config.lang.resetLessonStats}
	>
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
	<button class="start-btn icon" on:click={startLesson}>
		<Start />
	</button>
</div>

<style>
	.buttons {
		display: flex;
		align-items: center;
		margin-right: 0.5rem;
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

	.start-btn {
		padding: 0.35rem;
	}
	:global(.start-btn svg polygon) {
		/* fill: rgb(145, 230, 61); */
		fill: rgb(157, 231, 71);
		stroke: #000;
		vector-effect: non-scaling-stroke;
		stroke-width: 1;
	}
	:global(.start-btn:hover svg polygon) {
		fill: rgb(95, 172, 7);
		fill: rgb(193, 255, 24);
	}

	:global(.remove-btn svg line) {
		stroke: #af2222;
		fill: none;
		stroke-width: 2.2;
		vector-effect: non-scaling-stroke;
	}
	:global(.remove-btn:hover svg line) {
		stroke: #ec1515;
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
		/* fill: #b1dce7; */
		fill: #cddee2;
		stroke: #728185 !important;
	}

	:global(.settings-btn:hover svg) {
		stroke: #304d55 !important;
	}
	:global(.settings-btn:active svg, .settings-btn:focus svg) {
		fill: #c6f4ff;
	}
</style>
