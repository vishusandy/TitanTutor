<script lang="ts">
	import '$lib/../styles/global.scss';
	import '$lib/../styles/manage.scss';

	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import { home } from '$lib/util/nav';
	import { showEditLessonDialog } from '$lib/util/dialog';
	import { addUpdate, list, user_lessons_store } from '$lib/db';
	import { stockLessons } from '$lib/conf/lessons';
	import { lessonPlans } from '$lib/conf/lesson_plans';
	import ManageButtons from '$lib/components/manageButtons.svelte';

	export let data: PageData;
	let db = data.db;
	let config = data.config;
	let customLessons = data.customLessons;

	onMount(() => {
		document.documentElement.lang = config.lang.lang;
		document.documentElement.dir = config.lang.textDirection;
	});

	async function newLesson() {
		let storable = await showEditLessonDialog(config, db, null);

		if (storable === undefined) {
			return;
		}

		storable.id = 'user_' + config.nextCustomId.toString();
		await addUpdate(db, user_lessons_store, storable);
		config.nextCustomId += 1;
		await config.saveUserConfig(db);
		customLessons = (await list(db, user_lessons_store)) ?? [];
	}

	async function refreshList() {
		customLessons = (await list(db, user_lessons_store)) ?? [];
	}

	function startLesson(id: string, name: string) {
		if (window.confirm(config.lang.lessonDialogStartLesson.replace('%s', name))) {
			config.lastLesson = id;
			config.saveUserConfig(db);
			home();
		}
	}

	function cancel() {
		home();
	}
</script>

<svelte:head>
	<title>{config.lang.manageSettingsTitle}</title>
</svelte:head>

<div class="manage">
	<section>
		<h1>{config.lang.lessonDialogCustomTitle}</h1>
		<div class="grid">
			{#each customLessons as les (les.id)}
				<ManageButtons {config} lesson={les} {db} {customLessons} on:updated={refreshList} />
				<div class:highlight={les.id === config.lastLesson}>{les.name}</div>
			{/each}

			<div class="new-lesson">
				<button on:click={newLesson}>{config.lang.lessonDialogNewLesson}</button>
			</div>
		</div>
	</section>
	<section>
		<h1>{config.lang.lessonDialogStockTitle}</h1>
		<div class="subgrids">
			{#each lessonPlans.values() as p}
				<fieldset class="subgrid">
					<legend class="subgrid-title">{p.name}</legend>
					<div class="subgrid-content">
						{#each p.lessons
							.map((m) => stockLessons.get(m))
							// @ts-ignore
							.filter((f) => f !== undefined) as l (l.id)}
							<button
								class:highlight={l?.id === config.lastLesson}
								class="lesson-btn"
								on:click={() => {
									if (l) startLesson(l.id, l.name);
								}}>{l?.name}</button
							>
						{/each}
					</div>
				</fieldset>
			{/each}
		</div>
	</section>
	<footer>
		<button on:click={cancel}>{config.lang.back}</button>
	</footer>
</div>

<style>
	.manage {
		min-width: 40ch;
	}

	.grid {
		grid-template-columns: max-content max-content max-content auto;
		column-gap: 1.5rem;
		align-items: center;
		padding: 1rem 1.5rem;
	}

	.subgrids {
		/* border: none; */
		box-shadow: none;
		/* border-radius: 0px; */
	}

	.subgrid {
		padding: 0px;
		border-radius: 0px;
		border: 0px;
		background-color: transparent;
		/* border-top: 1px solid #b2b8be; */
	}

	.lesson-btn {
		display: block;
		background-color: transparent;
		user-select: text;
		cursor: pointer;
		padding: 0.3rem 1rem;
		margin: 0rem 0px;
		width: 100%;
		text-align: start;
		font-size: 1rem;
		font-family: var(--font-sans-humanist);
		padding-inline-start: 2rem;
		border-radius: 1rem;
	}

	.lesson-btn:hover {
		background-color: white;
	}
	.lesson-btn:focus {
		box-shadow: none;
	}

	.highlight {
		font-weight: bold;
	}

	.new-lesson {
		grid-column: 1/5;
		text-align: end;
	}
</style>
