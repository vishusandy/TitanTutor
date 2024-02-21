import type { Config } from './types/config';
import type { Lesson } from './lessons/lesson';
import type { LessonTypingConfig } from './types/lessons';
import type { LessonStats } from './stats';
import { Action, CheckMode, LetterState } from './types/types';
import { WordState, CompletedWord } from './word_state';
import { controlKeys } from './data/remap';

export class Tutor {
    config: Config;
    lesson: Lesson;
    stats: LessonStats;
    lessonOptions: Partial<LessonTypingConfig>;
    word: WordState;
    history: CompletedWord[];
    queue: string[];
    audioQueue: number;

    constructor(config: Config, lesson: Lesson, lessonOptions: Partial<LessonTypingConfig>, stats: LessonStats) {
        this.stats = stats;
        this.lesson = lesson;
        this.lessonOptions = lessonOptions;
        this.word = new WordState('');
        this.queue = [];
        this.history = [];
        this.audioQueue = 0;
        this.config = config.mergeLessonOptions(lessonOptions).mergeAvailable(lesson.overrides());
        this.nextWord();
    }

    isBackspace(config: Config, e: KeyboardEvent): boolean {
        if (e.key !== 'Backspace') return false;

        this.word.addBackspace(config.backspace);
        e.preventDefault();
        return true;
    }

    isChar(config: Config, e: InputEvent): Action {
        if (!e.data) return Action.None;

        let act = Action.None;

        // allow multiple chars (eg mobile input)
        for (const c of e.data) {
            const mapped = config.remap.get(c);
            if (mapped !== undefined) {
                this.word.addChar(mapped);
                act = Action.CharAdded | Action.Refresh;
            }
        }

        if (act != Action.None) {
            this.word.addKeystroke();
            e.preventDefault();
        }

        return act;
    }

    private checkAudioQueue() {
        if (this.config.tts === undefined || this.config.tts.mute) return;

        this.audioQueue -= 1;
        if (this.audioQueue <= 0) {
            this.audioQueue = this.config.tts.queueSize;
            this.config.tts.play([...this.queue]);
        }
    }

    private fillQueue() {
        let batch;
        while (this.queue.length < this.config.minQueue && (batch = this.lesson.batch(this.config.wordBatchSize - this.queue.length)) && batch.length !== 0) {
            this.queue.push(...batch);
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
            return Action.LessonCompleted | Action.Refresh;
        }

        let w = new WordState(next);
        if (w.state.length > 0) {
            w.state[0] = LetterState.Active;
        }

        this.word = w;
        return [prev, this.word];
    }

    private handleKeydownWordMode(e: KeyboardEvent) {
        if (e.key === ' ' || e.key === 'Enter') {
            if (this.word.completed()) {
                e.preventDefault();
                return Action.NextWord | Action.Refresh;
            }

            this.stats.resetWord(this.word);
            this.word.reset(this.word.getWord());
            e.preventDefault();

            return Action.WordReset | Action.Refresh;
        }

        if (controlKeys.has(e.key)) {
            e.preventDefault();
        }

        return Action.None;
    }

    private handleKeydownCharMode(e: KeyboardEvent): Action {
        if (this.word.atEnd()) {
            if (e.key === ' ') {
                e.preventDefault();
                return Action.NextWord | Action.Refresh;
            }

            if (!this.config.spaceOptional) {
                this.word.uncorrectedErrors += 1;
                e.preventDefault();
                return Action.MissedSpace;
            }
            return Action.NextWord | Action.Refresh;
        }

        return Action.None;
    }

    handleKeydown(e: KeyboardEvent): Action {
        return this.lesson.handleKeydown(e, this.config, this.word, this.stats);
    }
    
    handleBeforeInput(e: InputEvent): Action {
        return this.lesson.handleInput(e, this.config, this.word, this.stats);
    }
}
