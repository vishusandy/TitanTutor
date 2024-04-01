<script lang="ts">
	import '$lib/../styles/global.scss';
	import '$lib/../styles/manage.scss';

	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	import ManageButtons from '$lib/components/manageButtons.svelte';

	import { home } from '$lib/util/nav';
	import { showEditLessonDialog } from '$lib/util/dialog';
	import { addUpdate, list, user_lessons_store } from '$lib/db';
	import { stockLessons } from '$lib/conf/lessons';
	import { lessonPlans } from '$lib/conf/lesson_plans';
	import { loadUserConfig } from '$lib/config';

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
		const c = await loadUserConfig(db);
		storable.id = 'user_' + c.nextCustomId.toString();
		await addUpdate(db, user_lessons_store, storable);
		c.nextCustomId += 1;
		await c.saveUserConfig(db);
		customLessons = (await list(db, user_lessons_store)) ?? [];
		config = c;
	}

	async function refreshList() {
		customLessons = (await list(db, user_lessons_store)) ?? [];
	}

	async function startLesson(id: string, name: string) {
		if (window.confirm(config.lang.lessonDialogStartLesson.replace('%s', name))) {
			const c = await loadUserConfig(db);
			c.lastLesson = id;
			c.saveUserConfig(db);
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
		<div class="custom subgrids">
			{#each customLessons as les (les.id)}
				<div class="custom-lesson">
					<ManageButtons {config} lesson={les} {db} on:updated={refreshList} custom={true} />
					<button
						class="lesson-btn"
						class:highlight={les.id === config.lastLesson}
						on:click={() => startLesson(les.id, les.name)}>{les.name}</button
					>
				</div>
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
							{#if l}
								<div class="stock-lesson">
									<ManageButtons {config} lesson={l} {db} on:updated={refreshList} custom={false} />
									<button
										class:highlight={l?.id === config.lastLesson}
										class="lesson-btn"
										on:click={() => {
											if (l) startLesson(l.id, l.name);
										}}>{l?.name}</button
									>
								</div>
							{/if}
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

	.custom-lesson,
	.stock-lesson {
		display: flex;
		align-items: center;
		margin: 0px 0px;
	}

	.custom.subgrids {
		padding: 1rem 1rem;
	}

	.subgrid {
		padding: 0px;
		border-radius: 0px;
		border: 0px;
		background-color: transparent;
	}

	.lesson-btn {
		display: block;
		background-color: transparent;
		/* user-select: text; */
		cursor: pointer;
		margin: 0.2rem 0px;
		width: 100%;
		text-align: start;
		font-size: 1rem;
		font-family: var(--font-sans-humanist);
		border-radius: 1rem;
		padding: 0.2rem 0.8rem;
	}

	.lesson-btn:hover {
		background-color: white;
	}

	.highlight {
		font-weight: bold;
	}

	.new-lesson {
		grid-column: 1/5;
		text-align: center;
	}
</style>
