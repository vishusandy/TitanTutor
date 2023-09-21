
import { type Config, CheckMode, BackspaceMode } from './config';
import type { Session } from './session';
import { Action, LetterState } from './types';
import { WordState } from './word_state';

export class Tutor {
    session: Session;
    config: Config;
    word: WordState = new WordState('');
    history: WordState[] = [];
    queue: WordState[] = [];

    constructor(session: Session) {
        this.session = session;
        this.config = this.session.config;
        this.nextWord();
    }

    fillQueue() {
        if (this.queue.length < this.config.minQueue) {
            this.queue.push(...this.session.lesson.batch(this.config.wordBatchSize - this.queue.length).map((w) => {
                return new WordState(w);
            }));
        }
    }

    nextWord(): Action {
        if (!this.word.empty()) {
            this.history.push(this.word);
        }

        this.fillQueue();

        let w = this.queue.shift();
        if (w === undefined) {
            return Action.lessonCompleted;
        }

        if (w.state.length > 0) {
            w.state[0] = LetterState.Active;
        }
        this.word = w;
        return Action.Refresh;
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

        switch (this.config.check_mode) {
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
