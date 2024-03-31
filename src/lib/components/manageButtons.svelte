<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Start from '$lib/components/imgs/start.svelte';
	import Close from '$lib/components/imgs/close.svelte';
	import Pencil2 from '$lib/components/imgs/pencil2.svelte';
	import Cog from '$lib/components/imgs/cog.svelte';

	import { Config } from '$lib/config';
	import { home } from '$lib/util/nav';
	import { showEditLessonDialog, showLessonConfigDialog } from '$lib/util/dialog';
	import { remove, addUpdate, user_lessons_store, get, lesson_opts_store } from '$lib/db';
	import { loadUserLesson, type StorableUserWordlist, type UserWordList } from '$lib/lessons/base/user_wordlist';
	import type { LessonTypingConfig, StorableBaseLesson, StoredOverrides } from '$lib/types/lessons';
	import { Lesson } from '$lib/lessons/lesson';

	export let config: Config;
	export let lesson: StorableBaseLesson;
	export let db: IDBDatabase;
	export let customLessons: StorableUserWordlist[];
	const dispatch = createEventDispatcher();

	function startLesson() {
		if (window.confirm(config.lang.lessonDialogStartLesson.replace('%s', lesson.name))) {
			config.lastLesson = lesson.id;
			config.saveUserConfig(db);
			home();
		}
	}

	async function editLesson() {
		const l: UserWordList = (await loadUserLesson(config, db, lesson.id)) as UserWordList;
		const storable = await showEditLessonDialog(config, db, l);

		if (storable === undefined) {
			return;
		}

		addUpdate(db, user_lessons_store, storable);
		dispatch('updated', { edited: lesson.id });
	}

	async function deleteLesson() {
		const l = customLessons.find((sl) => sl.id === lesson.id);
		if (!l || !window.confirm(config.lang.lessonDialogConfirmDelete.replace('%s', l.name))) {
			return;
		}

		if (config.lastLesson === lesson.id) {
			config.lastLesson = null;
			config.saveUserConfig(db);
		}

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
</script>

<div class="buttons">
	<button class="remove-btn icon" on:click={() => deleteLesson()} title={config.lang.delete}><Close /></button>
	<button class="start-btn icon" on:click={() => startLesson()} title={config.lang.start}><Start /></button>
	<button class="settings-btn icon" on:click={() => editSettings()}>
		<Cog />
	</button>
	<button class="edit-btn icon" on:click={() => editLesson()} title={config.lang.edit}><Pencil2 /></button>
</div>

<style>
	.buttons {
		display: flex;
		align-items: center;
	}

	.buttons button {
		margin-inline-end: 0.2rem;
	}

	.icon {
		width: 1.8rem;
		height: 1.8rem;
	}

	.remove-btn {
		padding: 0.35rem;
	}

	.settings-btn {
		width: 2rem;
		height: 2rem;
	}

	.edit-btn {
		width: 1.8rem;
		height: 1.8rem;
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

	:global(.settings-btn svg) {
		fill: orange;
	}
</style>
