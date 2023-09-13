<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { type Config, CheckMode } from './config';
	import type { Session } from './session';
	import Word from './word.svelte';
	import { WordState } from './word_state';

	export let session: Session;
	let config: Config = session.config;

	let currentWord: WordState = new WordState('');
	let history: WordState[] = [];
	let queue: WordState[] = [];

	nextWord();

	onMount(() => {
		document.addEventListener('keydown', handleInput);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleInput);
	});

	function refreshWord() {
		currentWord = currentWord; // trigger update
	}

	function refreshHistory() {
		history = history;
	}

	function refreshQueue() {
		queue = queue;
	}

	function reset() {
		currentWord.reset(currentWord.word);
		refreshWord();
	}

	function lessonCompleted() {
		endLesson();
	}

	function endLesson() {}

	function fillQueue() {
		if (queue.length === 0) {
			queue = session.lesson.batch(config.wordBatchSize).map((w) => {
				return new WordState(w);
			});
		}
	}

	function nextWord() {
		if (!currentWord.empty()) {
			history.push(currentWord);
			refreshHistory();
		}

		fillQueue();

		let w = queue.shift();
		if (w === undefined) {
			lessonCompleted();
			return;
		}

		refreshQueue();
		currentWord = w;
	}

	function processKey(e: KeyboardEvent) {
		if (currentWord.isBackspace(config, e) || !currentWord.add(config, e)) {
			refreshWord();
			return;
		}
		refreshWord();
	}

	function modeChar(e: KeyboardEvent) {
		processKey(e);

		if (currentWord.atEnd()) {
			nextWord();
		}
	}

	function modeWord(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			if (currentWord.completed()) {
				nextWord();
			} else {
				reset();
			}

			e.preventDefault();
			return;
		}

		processKey(e);
	}

	function handleInput(e: KeyboardEvent) {
		switch (config.check_mode) {
			case CheckMode.Char:
				modeChar(e);
				break;
			case CheckMode.WordRepeat:
				modeWord(e);
				break;
			default:
				break;
		}

		return;
	}
</script>

<div id="history">
	{#each history as w}
		<Word word={w.word} state={w.state} />
	{/each}
	<Word word={currentWord.word} state={currentWord.state} active={true} />
	{#each queue as q}
		<Word word={q.word} state={q.state} />
	{/each}
</div>
<div id="typing">{currentWord.input}</div>
