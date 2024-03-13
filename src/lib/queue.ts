import type { Config } from './config';
import type { Lesson } from './lessons/lesson';
import type { LessonTypingConfig } from './types/lessons';
import type { LessonStats } from './stats';
import { Action, LetterState } from './types/types';
import { WordState, CompletedWord } from './word_state';

/**
 * The `Queue` class handles the word and audio queue as well as delegaiting keyboard event processing to the lesson.
 */
export class Queue {
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
        this.config = config;
        this.nextWord();
    }

    private checkAudioQueue() {
        if (this.config.tts === undefined || this.config.tts.mute) return;

        this.audioQueue -= 1;
        if (this.audioQueue <= 0) {
            this.audioQueue = this.config.tts.queueSize;
            this.config.tts.play([...this.queue]);
        }
    }

    playCurrentWord() {
        if (this.config.tts === undefined || this.config.tts.mute) return;

        this.config.tts.play(this.word.word);
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
}
