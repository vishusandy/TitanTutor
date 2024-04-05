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
	import type { StatsLog } from '$lib/stats';
	import Start from '$lib/components/imgs/start.svelte';

	export let data: PageData;
	let db = data.db;
	let config = data.config;
	let customLessons = data.customLessons;
	let stats = data.allStatsLogs;

	const statsMap: Map<string, StatsLog> = stats
		? new Map(stats.map((log: StatsLog) => [log.lesson_id, log]))
		: new Map();

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
					<ManageButtons
						{config}
						lesson={les}
						{db}
						on:updated={refreshList}
						custom={true}
						stats={statsMap.get(les.id)}
					/>
					<button
						class="lesson-btn"
						class:highlight={les.id === config.lastLesson}
						on:click={() => startLesson(les.id, les.name)}
						><Start />
						<div>{les.name}</div>
					</button>
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
									<ManageButtons
										{config}
										lesson={l}
										{db}
										on:updated={refreshList}
										custom={false}
										stats={statsMap.get(l.id)}
									/>
									<button
										class:highlight={l?.id === config.lastLesson}
										class="lesson-btn"
										on:click={() => {
											if (l) startLesson(l.id, l.name);
										}}
										><Start />
										<div>{l?.name}</div>
									</button>
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
		color: #172024;
		display: flex;
		align-items: center;
		justify-content: center;
		/* background-color: transparent; */
		/* background-color: #fbf8fc; */
		background-color: #f0f0f5;
		/* user-select: text; */
		cursor: pointer;
		margin: 0.2rem 0px 0.2rem 0.6rem;
		width: 100%;
		font-size: 1rem;
		font-family: var(--font-humanist);
		border-radius: 1rem;
		padding: 0.3rem 0.8rem 0.3rem 0.8rem;
	}
	.lesson-btn:not(:active, :focus) {
		box-shadow: 0px 0px 2px #5b505e;
	}

	.lesson-btn:hover,
	.lesson-btn:active,
	.lesson-btn:focus {
		background-color: #f0edf1;
		background-color: #e9e9f0;
	}

	.lesson-btn div {
		text-align: left;
		flex-basis: 100%;
		margin-left: 0.5rem;
	}

	:global(.lesson-btn svg) {
		width: 1.1rem;
		height: 1.1rem;
		fill: rgb(240, 161, 13);
		stroke: rgba(73, 47, 0, 0.568);
		stroke-width: 1px;
		filter: drop-shadow(0px 0px 1px #777);
		/* margin-inline-end: 0.3rem; */
		/* order:2; */
	}

	:global(.lesson-btn:active svg, .lesson-btn:focus svg, .lesson-btn:hover svg) {
		fill: rgb(236, 104, 15);
		stroke: rgba(73, 47, 0, 0.897);
	}

	:global(.lesson-btn svg polygon) {
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
	}

	.highlight {
		font-weight: bold;
	}

	.new-lesson {
		grid-column: 1/5;
		text-align: center;
		margin-top: 1.5rem;
	}
</style>
