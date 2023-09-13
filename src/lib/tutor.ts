
import { type Config, CheckMode } from './config';
import type { Session } from './session';
import { Action } from './types';
import { WordState } from './word_state';

export class Tutor {
    session: Session;
    config: Config;
    currentWord: WordState = new WordState('');
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
        if (!this.currentWord.empty()) {
            this.history.push(this.currentWord);
        }

        this.fillQueue();

        let w = this.queue.shift();
        if (w === undefined) {
            return Action.lessonCompleted;
        }

        this.currentWord = w;
        return Action.Refresh;
    }

    processKey(e: KeyboardEvent): Action {
        if (!this.currentWord.isBackspace(this.config, e)) {
            this.currentWord.add(this.config, e);
        }
        // if (this.currentWord.isBackspace(this.config, e) || !this.currentWord.add(this.config, e)) {
        //     return Action.Refresh;
        // }
        return Action.Refresh;
    }

    modeChar(e: KeyboardEvent): Action {
        let act = this.processKey(e);

        if (this.currentWord.atEnd()) {
            return this.nextWord();
        }

        return act;
    }

    modeWord(e: KeyboardEvent): Action {
        let act = Action.None;
        if (e.key === ' ' || e.key === 'Enter') {
            if (this.currentWord.completed()) {
                act = this.nextWord();
            } else {
                act = Action.Refresh;
            }

            e.preventDefault();
            return act;
        }

        return this.processKey(e);
    }

    handleInput(e: KeyboardEvent): Action {
        switch (this.config.check_mode) {
            case CheckMode.Char:
                return this.modeChar(e);
            case CheckMode.WordRepeat:
                return this.modeWord(e);
            default:
                return Action.None;
        }
    }
}
