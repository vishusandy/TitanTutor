
// https://www.speedtypingonline.com/typing-equations

import type { WordState } from "./word_state";

const wordLen: number = 5;

export class UserStats {
    duration: number = 0;
    keystrokes: number = 0;
    wordErrors: number = 0;
    backspaces: number = 0;
    words: number = 0;
    chars: number = 0;
    uncorrectedErrors: number = 0;
    correctedErrors: number = 0;
    sessions: number = 0;

    constructor(
        duration: number,
        keystrokes: number,
        wordErrors: number,
        backspaces: number,
        words: number,
        chars: number,
        uncorrectedErrors: number,
        correctedErrors: number,
        sessions: number,
    ) {
        this.duration = duration;
        this.keystrokes = keystrokes;
        this.wordErrors = wordErrors;
        this.backspaces = backspaces;
        this.words = words;
        this.chars = chars;
        this.uncorrectedErrors = uncorrectedErrors;
        this.correctedErrors = correctedErrors;
        this.sessions = sessions;
    }

    add(stats: SessionStats) {
        this.duration += stats.duration;
        this.keystrokes += stats.keystrokes;
        this.wordErrors += stats.wordErrors;
        this.backspaces += stats.backspaces;
        this.words += stats.words;
        this.chars += stats.chars;
        this.uncorrectedErrors += stats.uncorrectedErrors;
        this.correctedErrors += stats.correctedErrors;
        this.sessions += 1;
    }
}

// https://www.speedtypingonline.com/typing-equations
export class SessionStats {
    started: DOMHighResTimeStamp | undefined;
    duration: number = 0;
    keystrokes: number = 0;
    wordErrors: number = 0;
    backspaces: number = 0;
    words: number = 0;
    chars: number = 0;
    uncorrectedErrors: number = 0;
    correctedErrors: number = 0;

    constructor() {
        this.started = undefined;
    }

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

    getGrossWpm(): number {
        // todo: not accurate for word mode
        return (this.keystrokes / wordLen) / (this.duration / 60_000);
    }

    getNetWpm(): number {
        // todo: not accurate for word mode
        return ((this.keystrokes / wordLen) - this.uncorrectedErrors) / this.duration / 60_000;
    }

    getAccuracy(): number {
        return this.chars / this.keystrokes;
    }
}

