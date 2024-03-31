<script lang="ts">
	import { userwordlist_typeid } from '$lib/conf/lesson_ids';
	import type { Config } from '$lib/config';
	import { UserWordList } from '$lib/lessons/base/user_wordlist';
	import type { StorableBaseLesson } from '$lib/types/lessons';
	import { adjustTextarea } from '$lib/util/dom';

	export let config: Config;
	export let lesson: UserWordList | null = null;
	export let db: IDBDatabase;
	db; // suppress the unused-export-let warning from above

	let textarea: HTMLTextAreaElement;
	let nameInput: HTMLInputElement;
	let lessonType: string = lesson !== null ? lesson.baseLesson().getType() : userwordlist_typeid;

	let id: string = '';
	let name: string = '';
	let lang: string = config.lang.lang;

	let words: string[] = [];
	let wordsInput: string = '';
	if (lesson !== null && lessonType === userwordlist_typeid) {
		const wl = lesson.baseLesson() as UserWordList;
		words = wl.words;
		wordsInput = wl.words.join('\n') + '\n';
		id = wl.id.substring(5);
		name = wl.name;
		lang = wl.lang;
	}

	export function getData(): StorableBaseLesson {
		const w: string[] = [];
		words.forEach((a) => w.push(...a.split(' ').filter((v) => v)));
		return UserWordList.newStorable('user_' + id, name, w);
	}

	function wordsChanged(e: Event) {
		words = wordsInput.split(/\r?\n/).filter((s) => s);
		adjustTextarea(e);
	}
</script>

<div class="dialog-grid">
	<label for="lessonName">{config.lang.lessonDialogLessonName}</label>
	<input id="lessonName" bind:this={nameInput} bind:value={name} required type="text" />

	<div class="lesson-words">
		<div class="wordsLabel">
			<label for="lessonWords">{config.lang.lessonDialogWords}</label>
		</div>
		<textarea bind:this={textarea} bind:value={wordsInput} on:input={wordsChanged} id="lessonWords" required />
	</div>
</div>

<style>
	.dialog-grid {
		display: grid;
		grid-template-columns: max-content max-content;
		column-gap: 3rem;
		row-gap: 1.3rem;
		margin: 1rem auto;
		width: min-content;
		align-content: center;
		align-items: center;
	}

	.lesson-words {
		grid-column: 1/3;
	}

	.wordsLabel {
		text-align: start;
	}

	#lessonWords {
		width: 100%;
		min-height: 10em;
	}

	textarea {
		border-radius: 0.5rem;
		border: 1px solid #bcc2c9;
		padding: 0.5rem;
	}

	textarea:focus {
		transition: border-color 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
		box-shadow: 0 0 0px 0.25em var(--highlight-focus);
		outline: 0px;
	}
</style>
