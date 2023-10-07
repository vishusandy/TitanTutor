
// https://www.speedtypingonline.com/typing-equations

import type { WordState } from "./word_state";

export const wordLen: number = 5;

// https://www.speedtypingonline.com/typing-equations
export class UserStats {
    duration: number = 0;
    keystrokes: number = 0;
    wordErrors: number = 0;
    backspaces: number = 0;
    words: number = 0;
    chars: number = 0;
    uncorrectedErrors: number = 0;
    correctedErrors: number = 0;

    add(word: WordState) {
        this.words += 1;
        this.keystrokes += word.keystrokes;
        this.correctedErrors += word.correctedErrors;
        this.uncorrectedErrors += word.uncorrectedErrors;
        this.backspaces += word.backspaces;
        this.chars += word.wordChars.length;
        this.wordErrors += word.wordAttempts;
    }

    resetWord(word: WordState) {
        // todo
    }

    getGrossWpm(): number {
        // todo: not accurate for word mode
        return (this.keystrokes / wordLen) / (this.duration / 60_000);
    }

    getNetWpm(): number {
        // todo: not accurate for word mode
        // fix: this appears to be wrong
        return ((this.keystrokes / wordLen) - this.uncorrectedErrors) / this.duration / 60_000;
    }

    getAccuracy(): number {
        return this.chars / this.keystrokes;
    }
}

export class SessionStats extends UserStats {
    started: DOMHighResTimeStamp | undefined = undefined;

    pause() {
        if (this.started !== undefined) {
            this.duration += performance.now() - this.started;
            this.started = undefined;
        }
    }

    resume() {
        if (this.started === undefined) {
            this.started = performance.now();
        }
    }
}
