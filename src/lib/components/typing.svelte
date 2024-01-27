<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { base } from '$app/paths';

	import Word from './typing/word.svelte';
	import QueuedWord from './typing/queued_word.svelte';

	import { addMissedSpace, addSpace } from '$lib/util/dom';
	import { CheckMode, type Config } from '$lib/types/config';
	import { LessonStats } from '$lib/stats';
	import { WordState } from '$lib/word_state';
	import { Tutor } from '$lib/tutor';
	import { Action } from '$lib/types/types';
	import type { Audio } from '$lib/audio';
	import { Lesson } from '$lib/lessons/lesson';
    import type { LessonTypingConfig } from '$lib/types/lessons';
	import {
		showConfigDialog,
		showLessonConfigDialog,
		showStatsConfirmDialog,
		showStatsDialog,
		showVoiceDialog
	} from '$lib/util/dialog';
	import Timer from './timer.svelte';
	import { lessonInSeries, lessonPlans } from '$lib/conf/lesson_plans';

	export let db: IDBDatabase;
	export let config: Config;
	export let lesson: Lesson;
	export let lessonOpts: Partial<LessonTypingConfig>;
	export let lessonStats: LessonStats;

	let tutor = new Tutor(config, lesson, lessonOpts, lessonStats);
	let lessonPlan: string | undefined = lessonInSeries.get(lesson.baseLesson().id);
	let lessonSeries = lessonPlan !== undefined ? lessonPlans.get(lessonPlan) : undefined;
	let planIdx =
		lessonSeries !== undefined ? lessonSeries.lessons.findIndex((v) => v == lessonPlan) : undefined;

	let started: boolean = false;
	let paused: boolean = true;
	let finished: boolean = false;

	let activeWord: HTMLElement | undefined;
	let textbox: HTMLInputElement | undefined;
	let historyNode: HTMLElement;

	$: {
		tutor.word.word; // trigger scroll() when word changes
		scroll();
	}

	onMount(async () => {
		document.addEventListener('click', handleBodyClick);
		document.addEventListener('touchstart', handleBodyClick);

		if (textbox) {
			started = false;
			await tick();
			textbox.focus();
		}

		Lesson.saveLast(lesson, config, db);
	});

	function handleBodyClick(_: Event) {
		textbox?.focus();
	}

	async function startInput(e: Event) {
		if ('key' in e) {
			if (e.key === 'Tab') return;
			if (e.key === tutor.config.pause) {
				e.preventDefault();
				return;
			}
		}

		started = true;
		unpause();
	}

	async function unpause(e: KeyboardEvent | undefined = undefined) {
		if (textbox === undefined) return;
		paused = false;
		lessonStats.resume();
		await tick();
		textbox.focus();

		if (e !== undefined) {
			handleAction(tutor.handleKeydown(e));
		}
	}

	function pause(_: Event) {
		if (textbox === undefined) return;
		paused = true;
		if (tutor.word.atEnd() && tutor.word.word === tutor.word.input) {
			handleAction(Action.NextWord);
		}
		lessonStats.pause();
	}

	async function lessonCompleted() {
		endLesson();
	}

	function confirmEndLesson() {
		if (window.confirm(tutor.config.lang.stopMsg)) {
			endLesson();
		}
	}

	async function reset(lessonOpts?: Partial<LessonTypingConfig>) {
		const id = lesson.baseLesson().id;
		// if (lessonOpts === undefined) lessonOpts = await Lesson.getLessonOptions(id, db);
		if (lessonOpts === undefined) lessonOpts = {};

		lesson = await Lesson.load(id, config, db);
		tutor = new Tutor(config, lesson, lessonOpts, lessonStats);
		started = false;
		paused = true;
		finished = false;
		lessonStats = new LessonStats(id, tutor.config.checkMode);

		let child;
		while ((child = historyNode.firstChild)) historyNode.removeChild(child);
	}

	async function endLesson() {
		if (lessonStats.chars !== 0) {
			paused = true;
			lessonStats.pause();
			lessonStats = lessonStats;
			
            // lesson.lessonEnd();

			if (config.logStats) {
				await showStatsConfirmDialog(config, db, lessonStats).then((v: boolean | undefined) => {
					if (v === true) {
						config.userStats.add(lessonStats);
						config.saveUserConfig(db);
					}
				});
			}
		}
		finished = true;
		return;
	}

	async function shortcuts(e: KeyboardEvent) {
		if (e.key === tutor.config.pause || e.key === 'Escape') {
			if (paused) {
				unpause();
				textbox?.focus();
			} else {
				pause(e);
			}
			if (!started) started = true;
			e.preventDefault();
		} else if (e.key === tutor.config.stop && started) {
			e.preventDefault();
			pause(e);
			confirmEndLesson();
		}
	}

	function handleClick(_: Event) {
		textbox?.focus();
	}

	function handleBeforeInput(e: InputEvent) {
		handleAction(tutor.handleBeforeInput(e));
	}

	function handleKeydown(e: KeyboardEvent) {
		handleAction(tutor.handleKeydown(e));
	}

	function handleAction<T = undefined>(action: Action, ctx: T | undefined = undefined) {
		switch (action) {
			case Action.WordReset:
			case Action.CharAdded:
			case Action.Refresh:
				tutor = tutor;
				break;
			case Action.LessonCompleted:
				if (!tutor.word.empty()) addToHistory(tutor.word);
				tutor.word = new WordState('');
				tutor = tutor;
				lessonCompleted();
				break;
			case Action.MissedSpace:
				handleAction(Action.NextWord, true);
				addMissedSpace(config.lang, historyNode);
				break;
			case Action.NextWord:
				const n = tutor.nextWord();
				if (!Array.isArray(n)) {
					if (n !== Action.NextWord) handleAction(n);
					return;
				}
				if (n[0] !== undefined) {
					addToHistory(n[0]);
					if (ctx === undefined) addSpace(config.lang, historyNode);
				}
				tutor = tutor;
				break;
		}
	}

	async function scroll() {
		await tick();
		if (activeWord) {
			activeWord.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function addToHistory(w: WordState) {
		const c = new Word({
			target: historyNode,
			props: {
				word: w.wordChars,
				state: w.state
			}
		});
	}

	async function showSessionStatsDialog() {
		showStatsDialog(config.lang.statsDialogSessionTitle, config, db, lessonStats);
	}

	async function showUserStatsDialog() {
		showStatsDialog(config.lang.statsDialogUserTitle, config, db, config.userStats);
	}

	async function showAudioDialog(_: Event) {
		showVoiceDialog(config, db).then((audio?: Audio) => {
			if (audio !== undefined) {
				config.tts = audio;
				config.saveUserConfig(db);
			}
		});
	}

	async function showLessonOptions(): Promise<void> {
		const data = await showLessonConfigDialog(config, db, lesson, tutor.lessonOptions);
		if (data !== undefined) {
			let lessonOptions: Partial<LessonTypingConfig>;
			[lesson, lessonOptions] = data;
			Lesson.saveLessonOptions(lesson.baseLesson().id, lessonOptions, db);
			reset(lessonOptions);
		}
		// return showLessonConfigDialog(config, db, lesson, tutor.lessonOptions).then(
		// 	(data?: [Lesson, Partial<LessonTypingConfig>]) => {
		// 		if (data !== undefined) {
		// 			let lessonOptions: Partial<LessonTypingConfig>;
		// 			[lesson, lessonOptions] = data;
		// 			Lesson.saveLessonOptions(lesson.baseLesson().id, lessonOptions, db);
		// 			reset(lessonOptions);
		// 		}
		// 	}
		// );
	}

	async function showUserConfig(_: Event) {
		showConfigDialog(config, db).then((conf?: Config) => {
			if (conf !== undefined) {
				config = conf;
				reset();
				config.saveUserConfig(db);
				reset();
			}
		});
	}
</script>

<svelte:document on:keydown={shortcuts} />
<div class="frame">
	<header class="header">
		<ul>
			<li>
				<button class="link" type="button" on:click={showUserConfig}
					>{config.lang.openConfigDialog}</button
				>
			</li>
			<li>
				<button class="link" type="button" on:click={showAudioDialog}
					>{config.lang.openTtsDialog}</button
				>
			</li>
			<li>
				<button class="link" type="button" on:click={showUserStatsDialog}
					>{config.lang.openUserStatsDialog}</button
				>
			</li>
		</ul>
	</header>

	<section class:paused>
		<h1 class="tutor-title">
			{lesson.baseLesson().getName(config.lang)}
		</h1>

		<nav class="lesson-buttons">
			<div class="tutor-above">
				<div class="counter" class:active={!paused}>
					{#if !started}
						{config.lang.notStarted}
					{:else}
						<Timer stats={lessonStats} lang={config.lang} />
					{/if}
				</div>
				<div class="tutor-menu">
					{#if tutor.config.until !== null}
						<div class="word-progress">{tutor.history.length}/{tutor.config.until}</div>
					{/if}
					<button
						type="button"
						class="link icon"
						on:click={showSessionStatsDialog}
						title={config.lang.openSessionStatsDialog}
						><img src="{base}/imgs/stats.svg" alt={config.lang.openSessionStatsDialog} /></button
					>
					<button
						class="link icon"
						on:click={showLessonOptions}
						title={config.lang.openLessonConfigDialog}
						><img src="{base}/imgs/gear.svg" alt={config.lang.openLessonConfigDialog} /></button
					>

					<button
						class="link icon stop-button"
						disabled={!started}
						on:click={confirmEndLesson}
						title={config.lang.stop}
						><img src="{base}/imgs/stop.svg" alt={config.lang.stop} /></button
					>
				</div>
			</div>
		</nav>

		<div class="tutor-words" class:paused class:char-mode={config.checkMode === CheckMode.Char}>
			<span bind:this={historyNode} class="history" /><Word
				bind:span={activeWord}
				word={tutor.word.wordChars}
				state={tutor.word.state}
				active={true}
			/><span class="spacer" /><span class="queue">
				{#each tutor.queue as q}
					<QueuedWord word={q} />{' '}
				{/each}
			</span>
		</div>

		{#if !finished}
			<div class="tutor-bottom">
				{#if paused && !started}
					<input
						class="tutor-input"
						bind:this={textbox}
						placeholder={config.lang.inputNotStarted}
						on:keydown={startInput}
					/>
				{:else if paused && started}
					<input
						class="tutor-input"
						bind:this={textbox}
						placeholder={config.lang.inputPaused}
						on:keydown={unpause}
					/>
				{:else}
					<input
						class="tutor-input"
						bind:this={textbox}
						value={tutor.word.input}
						on:blur={pause}
						on:beforeinput={handleBeforeInput}
						on:keydown={handleKeydown}
						on:selectstart|preventDefault={() => {}}
						on:mousedown|preventDefault={() => {}}
						on:click|preventDefault={handleClick}
					/>
				{/if}
			</div>
		{:else}
			<div class="finished">
				<button type="button" on:click={() => reset()}>{config.lang.restartLesson}</button>
			</div>
		{/if}
	</section>
</div>

<style>
	.tutor-above {
		width: var(--width);
		max-width: var(--max-width);
		text-align: center;
		margin: 0px auto 2rem;
	}

	.word-progress {
		align-self: center;
		margin: 0px 1rem;
		font-family: var(--font-humanist);
	}

	.counter {
		font-family: var(--font-sans-serif);
		display: flex;
		width: fit-content;
		margin: 0px auto 1rem;
		transition-property: background-color, color;
		transition-duration: 0.5s;
		transition-timing-function: ease-in-out;
		padding: 0.4rem;
		border-radius: 0.3rem;
	}

	.counter.active {
		color: white;
		background-color: #155b77;
	}

	.tutor-title {
		font-size: 2.5rem;
		text-align: center;
		font-family: var(--font-title);
		font-weight: bold;
		margin: auto;
	}

	.tutor-words {
		--drop-shadow-color: rgba(206, 74, 12, 0.1);
		--border-color: rgba(206, 74, 12, 0.3);
		box-sizing: border-box;
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		background: rgba(255, 255, 255, 1);
		font-family: var(--font-monospace);
		font-size: 1.7rem;
		margin: 0px auto;
		padding: 0px 1em;
		width: var(--width);
		max-width: var(--max-width);
		height: 12em;
		overflow: auto;
		text-align: center;
		scroll-behavior: smooth;
		scroll-snap-type: y mandatory;
		filter: drop-shadow(1px 1px 2px var(--drop-shadow-color))
			drop-shadow(2px 2px 4px var(--drop-shadow-color))
			drop-shadow(4px 4px 8px var(--drop-shadow-color));
	}

	.tutor-words.paused {
		--drop-shadow-color: rgba(36, 58, 92, 0.1);
		--border-color: rgba(36, 58, 92, 0.4);
	}

	.tutor-bottom {
		text-align: center;
		width: var(--width);
		max-width: var(--max-width);
		margin: 1.5rem auto;
	}

	.tutor-input {
		box-shadow: none !important;
		font-size: 1.2rem;
		width: 100%;
		max-width: 30ch;
		text-align: center;
		padding: 0.8rem 2rem;
		caret-color: transparent;
	}

	.finished {
		width: 100%;
		max-width: 30ch;
		text-align: center;
		margin: 2rem auto;
	}

	.tutor-input:focus,
	.tutor-input {
		font-size: 1.5rem;
		--drop-shadow-color: rgba(206, 74, 12, 0.1);
		--input-border: rgba(36, 58, 92, 0.4);
	}

	.paused .tutor-input:focus {
		--drop-shadow-color: rgba(129, 47, 15, 0.1);
		--input-border: rgba(36, 58, 92, 0.4);
	}

	.tutor-menu {
		font-size: 1.2rem;
		display: flex;
		text-align: center;
		justify-content: right;
	}

	.stop-button:not(.hidden) {
		animation: opacity-fadein 0.5s ease-out 0s 1;
	}

	@keyframes opacity-fadein {
		0% {
			opacity: 0;
		}
	}
</style>
