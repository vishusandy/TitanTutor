import type { BackspaceMode, CheckMode } from "../config";


export class LessonOptions {
    until?: number;
    random: boolean;
    wordBatchSize?: number;
    minQueue?: number;
    checkMode?: CheckMode;
    backspace?: BackspaceMode;

    constructor(
        random: boolean = true,
        until?: number,
        wordBatchSize?: number,
        minQueue?: number,
        checkMode?: CheckMode,
        backspace?: BackspaceMode
    ) {
        this.until = until;
        this.random = random;
        this.wordBatchSize = wordBatchSize;
        this.minQueue = minQueue;
        this.checkMode = checkMode;
        this.backspace = backspace;
    }

    serialize() {
        return JSON.stringify({
            random: this.random,
            until: this.until,
            wordBatchSize: this.wordBatchSize,
            minQueue: this.minQueue,
            checkMode: this.checkMode,
            backspace: this.backspace,
        });
    }

    static deserialize(s: string): LessonOptions {
        return <LessonOptions>JSON.parse(s);
    }

    static default(): LessonOptions {
        return new LessonOptions();
    }

    static loadOptions(lessonName: string) {
        const s = localStorage.getItem(`options_${lessonName}`);
        if (s === null) return LessonOptions.default();
        return LessonOptions.deserialize(s);
    }

    saveOptions(lessonName: string) {
        localStorage.setItem(`options_${lessonName}`, this.serialize());
    }
}
