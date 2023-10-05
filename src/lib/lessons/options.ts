import type { LessonConfig } from "../config";


export class LessonOptions {
    until?: number;
    random: boolean;
    config: Partial<LessonConfig>;

    constructor(
        config: Partial<LessonConfig> = {},
        random: boolean = true,
        until?: number,
    ) {
        this.until = until;
        this.random = random;
        this.config = config;
    }

    serialize() {
        return JSON.stringify({
            until: this.until,
            random: this.random,
            config: this.config,
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
