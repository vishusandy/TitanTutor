
import type { Config, CheckMode } from './config';
import type { Session } from './session';
import { LetterState, Action } from './types';
import { WordState } from './word_state';

class Tutor {
    session: Session;
    config: Config;
    currentWord: WordState = new WordState('');
    history: WordState[] = [];
    queue: WordState[] = [];

    constructor(session: Session) {
        this.session = session;
        this.config = session.config;
    }

    fillQueue() {
        if (this.queue.length === 0) {
            this.queue = this.session.lesson.batch(this.config.wordBatchSize).map((w) => {
                return new WordState(w);
            });
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
}
