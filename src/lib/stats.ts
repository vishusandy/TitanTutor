
// https://www.speedtypingonline.com/typing-equations]
import type { CheckMode } from "./config";
import type { WordState } from "./word_state";

export const wordLen: number = 5;

// https://www.speedtypingonline.com/typing-equations

export class BaseStats {
    duration: number = 0;
    keystrokes: number = 0;
    wordErrors: number = 0;
    backspaces: number = 0;
    words: number = 0;
    chars: number = 0;
    uncorrectedErrors: number = 0;
    correctedErrors: number = 0;


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

export class SessionStats extends BaseStats {
    started: DOMHighResTimeStamp | undefined = undefined;
    mode: CheckMode;

    constructor(mode: CheckMode) {
        super();
        this.mode = mode;
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
}

export class UserStats extends BaseStats {
    sessions: number = 0;

    static deserialize(o: Object) {
        const stats = new UserStats();
        for (const key in o) {
            if (stats.hasOwnProperty(key)) {
                // @ts-ignore
                stats[key] = o[key];
            }
        }
        return stats;
    }

    add(session: SessionStats) {
        this.duration += session.duration;
        this.words += session.words;
        this.keystrokes += session.keystrokes;
        this.correctedErrors += session.correctedErrors;
        this.uncorrectedErrors += session.uncorrectedErrors;
        this.backspaces += session.backspaces;
        this.chars += session.chars;
        this.wordErrors += session.wordErrors;
        this.sessions += 1;
    }
}
