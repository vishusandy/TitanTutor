<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { type Config, BackspaceMode, CheckMode } from './config';
	import type { Session } from './session';
	import Word from './word.svelte';
	import { LetterState, type WordState, blank_state } from './types';

	export let session: Session;
	let config: Config = session.config;

	let currentWord: WordState = blank_state;
	let history: WordState[] = [];
	let queue: string[] = [];
	// let textbox: HTMLDivElement | undefined;
	nextWord();

	onMount(() => {
		document.addEventListener('keydown', handleInput);
		currentWord = blank_state;
		history = [];
		queue = [];
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleInput);
		currentWord = blank_state;
		history = [];
		queue = [];
	});

	function endLesson() {}

	function resetWord(word: string) {
		currentWord.word = word;
		currentWord.state = currentWord.word.split('').map((_) => LetterState.Incomplete);
		currentWord.input = '';
	}

	function mapState(): LetterState[] {
		let rst = currentWord.state.map((_, i) => {
			if (currentWord.input.length === i) return LetterState.Active;
			if (currentWord.input.length > i) {
				if (currentWord.word[i] === currentWord.input[i]) return LetterState.Complete;
				return LetterState.Error;
			} else return LetterState.Incomplete;
		});
		return rst;
	}

	function fillQueue() {
		if (queue.length === 0) {
			queue = session.lesson.batch(config.showWords);
		}
	}

	function nextWord() {
		if (currentWord && currentWord.word != '') {
			history.push(currentWord);
		}

		fillQueue();

		let word = queue.shift();
		if (word === undefined) {
			endLesson();
			return;
		}

		resetWord(word);
		console.log(currentWord);
		console.log(history);
	}

	function backspace(e: KeyboardEvent): boolean {
		if (e.key == 'Backspace') {
			if (config.backspace == BackspaceMode.Accept) {
				currentWord.input = currentWord.input.slice(0, -1);
				currentWord.state = mapState();
			}

			e.preventDefault();
			return true;
		}

		return false;
	}

	function addChar(e: KeyboardEvent): boolean {
		let mapped = config.mapping(e.key);

		if (mapped == null) {
			return false;
		}

		e.preventDefault();
		currentWord.input += mapped;
		currentWord.state = mapState();

		return true;
	}

	function handleInput(e: KeyboardEvent) {
		switch (config.check_mode) {
			case CheckMode.Char:
				if (backspace(e) || !addChar(e)) return;

				if (currentWord.input.length === currentWord.word.length) {
					nextWord();
				}
				break;

			default:
				break;
		}

		return;
		if (
			e.key == ' ' &&
			config.check_mode == CheckMode.Char &&
			currentWord.input.length < currentWord.word.length
		) {
			currentWord.input += ' ';
			currentWord.state = mapState();
			e.preventDefault();
			return;
		}

		if (e.key == ' ' || e.key == 'Enter') {
			if (currentWord.input != currentWord.word) {
				if (config.check_mode == CheckMode.WholeWordRepeat) {
					currentWord.input = '';
					currentWord.state = mapState();
				} else {
					nextWord();
				}
			}
			console.log(`space=${e.key}`);
			return;
		} else if (e.key == 'Backspace') {
			if (config.backspace == BackspaceMode.Accept) {
				currentWord.input = currentWord.input.slice(0, -1);
				currentWord.state = mapState();
			}
			e.preventDefault();
			return;
		}

		let mapped = config.mapping(e.key);

		if (mapped == null) {
			return;
		}

		e.preventDefault();
		currentWord.input += mapped;
		currentWord.state = mapState();

		if (
			config.backspace != BackspaceMode.Accept &&
			config.check_mode == CheckMode.WholeWordRepeat &&
			currentWord.input.length >= currentWord.word.length
		) {
			nextWord();
		}
	}
</script>

<div id="history">
	{#each history as w}
		<Word word={w.word} state={w.state} />
	{/each}
	<Word word={currentWord.word} state={currentWord.state} active={true} />
</div>
<div id="typing">{currentWord.input}</div>
