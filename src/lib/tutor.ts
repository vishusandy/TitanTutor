
import { type Config, CheckMode, BackspaceMode, type LessonTypingConfig } from './config';
import { getLessonConfig, type Lesson } from './lessons/lessons';
import type { SessionStats } from './stats';
import { Action, LetterState } from './types';
import { WordState, CompletedWord } from './word_state';
import { controlKeys } from './remap';
import type Word from './components/typing/word.svelte';

export class Tutor {
    config: Config;
    lesson: Lesson;
    stats: SessionStats;
    overrides: LessonTypingConfig;
    word: WordState = new WordState('');
    history: CompletedWord[] = [];
    queue: string[] = [];
    audioQueue: number = 0;

    constructor(config: Config, lesson: Lesson, stats: SessionStats) {
        this.stats = stats;
        this.config = config;
        this.lesson = lesson;
        this.overrides = getLessonConfig(lesson.getLessonName(), config);;
        this.nextWord();
    }

    checkAudioQueue() {
        if (this.config.tts === undefined || this.config.tts.mute) return;

        this.audioQueue -= 1;
        if (this.audioQueue <= 0) {
            this.audioQueue = this.config.tts.queueSize;
            this.config.tts.play([...this.queue]);
        }
    }

    nextWord(): Action | [WordState | undefined, WordState] {
        let prev = undefined;

        if (!this.word.empty()) {
            prev = this.word;
            this.history.push(new CompletedWord(this.word.wordChars, this.word.state));
            this.stats.add(this.word);
        }

        this.fillQueue();
        this.checkAudioQueue();

        let next = this.queue.shift();
        if (next === undefined) {
            this.word = new WordState('');
            return Action.LessonCompleted;
        }

        let w = new WordState(next);
        if (w.state.length > 0) {
            w.state[0] = LetterState.Active;
        }

        this.word = w;
        return [prev, this.word];
    }

    fillQueue() {
        if (this.queue.length < this.config.minQueue) {
            this.queue.push(...this.lesson.batch(this.config.wordBatchSize - this.queue.length));
        }
    }

    modeWordKeydown(e: KeyboardEvent) {
        let act = Action.None;
        // console.log(e.key);
        if (e.key === ' ' || e.key === 'Enter') {
            if (this.word.completed()) {
                e.preventDefault();
                return Action.NextWord;
            } else {
                this.stats.resetWord(this.word);
                this.word.reset(this.word.getWord());
                this.word.state[0] = LetterState.Active;
                e.preventDefault();
                return Action.Refresh;
            }
        }

        if (controlKeys.has(e.key)) {
            console.log('key is control key')
            e.preventDefault();
        }

        return act;
    }

    modeCharKeydown(e: KeyboardEvent): Action {
        if (this.word.atEnd()) {
            return Action.NextWord;
        }

        return Action.None;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType
    // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
    handleKeydown(e: KeyboardEvent): Action {
        if (this.word.isBackspace(this.config, e)) {
            return Action.Refresh;
        }

        switch (this.config.checkMode) {
            case CheckMode.Char:
                return this.modeCharKeydown(e);
            case CheckMode.WordRepeat:
                return this.modeWordKeydown(e);
            default:
                return Action.None;
        }
    }

    handleBeforeInput(e: InputEvent): Action {
        if (e.inputType === 'deleteContentBackward' && this.config.backspace === BackspaceMode.Accept) {
            e.preventDefault();

            if (this.word.addBackspace(this.config)) {
                return Action.Refresh;
            }

            return Action.None;
        }

        if (e.inputType !== 'insertText') {
            e.preventDefault();
            return Action.None;
        }

        return this.word.isChar(this.config, this.config.remap, e);
    }
}
