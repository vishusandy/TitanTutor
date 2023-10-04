
import { type Config, CheckMode, BackspaceMode, type Overrides } from './config';
import type { Lesson } from './lessons/lessons';
import type { LessonOptions } from './lessons/options';
import type { SessionStats } from './stats';
import { Action, LetterState } from './types';
import { WordState, CompletedWord } from './word_state';

export class Tutor {
    // session: Session;
    config: Config;
    lesson: Lesson;
    stats: SessionStats;
    overrides: Overrides;
    word: WordState = new WordState('');
    history: CompletedWord[] = [];
    queue: string[] = [];
    audioPlayed: number = 0;

    constructor(config: Config, lesson: Lesson, opts: LessonOptions, stats: SessionStats) {
        // this.session = session;
        this.stats = stats;
        this.config = config;
        this.lesson = lesson;
        this.overrides = this.config.getOverrides(opts);
        this.nextWord();
    }

    nextWord(): Action {
        if (!this.word.empty()) {
            this.history.push(new CompletedWord(this.word.wordChars, this.word.state));
        }

        this.fillQueue();

        let next = this.queue.shift();
        if (next === undefined) {
            this.word = new WordState('');
            return Action.lessonCompleted;
        }

        this.stats.add(this.word);
        let w = new WordState(next);
        if (w.state.length > 0) {
            w.state[0] = LetterState.Active;
        }

        this.word = w;
        return Action.Refresh;
    }

    fillQueue() {
        if (this.queue.length < this.config.minQueue) {
            this.queue.push(...this.lesson.batch(this.config.wordBatchSize - this.queue.length));
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

        return this.word.isChar(this.config, e);
    }

    modeWordKeydown(e: KeyboardEvent) {
        let act = Action.None;
        if (e.key === ' ' || e.key === 'Enter') {
            if (this.word.completed()) {
                act = this.nextWord();
            } else {
                act = Action.Refresh;
                this.stats.resetWord(this.word);
                this.word.reset(this.word.getWord());
                this.word.state[0] = LetterState.Active;
            }

            e.preventDefault();
        }

        if (this.config.mapping.controlKey(e.key)) {
            e.preventDefault();
        }
        return act;
    }

    modeCharKeydown(e: KeyboardEvent): Action {
        if (this.word.atEnd()) {
            return this.nextWord();
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

    // processKey(e: KeyboardEvent): Action {
    //     if (!this.word.isBackspace(this.config, e)) {
    //         this.word.isChar(this.config, e);
    //     }

    //     return Action.Refresh;
    // }

    // modeChar(e: KeyboardEvent): Action {
    //     let act = this.processKey(e);

    //     if (this.word.atEnd()) {
    //         return this.nextWord();
    //     }

    //     return act;
    // }

    // modeWord(e: KeyboardEvent): Action {
    //     let act = Action.None;
    //     if (e.key === ' ' || e.key === 'Enter') {
    //         if (this.word.completed()) {
    //             act = this.nextWord();
    //         } else {
    //             act = Action.Refresh;
    //             this.word.reset(this.word.getWord());
    //             this.word.state[0] = LetterState.Active;
    //         }

    //         e.preventDefault();
    //         return act;
    //     }

    //     return this.processKey(e);
    // }

    // handleInput(e: KeyboardEvent): Action {
    //     switch (this.config.check_mode) {
    //         case CheckMode.Char:
    //             return this.modeChar(e);
    //         case CheckMode.WordRepeat:
    //             return this.modeWord(e);
    //         default:
    //             return Action.None;
    //     }
    // }
}
