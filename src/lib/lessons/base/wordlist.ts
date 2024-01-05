import type { BaseLesson, Lesson, StorableBaseLesson } from "$lib/lessons/lesson";
import type { Language } from "$lib/data/language";

export type StorableBaseWordList = { name: string } & StorableBaseLesson;

export abstract class BaseWordList implements BaseLesson {
    words: string[];
    pos: number;
    id: string;
    name: string;

    constructor(words: string[], id: string, name: string) {
        if (words.length === 0) {
            throw new Error("Invalid word list: the list must contain at least one element");
        }

        this.pos = 0;
        this.words = words;
        this.id = id;
        this.name = name;
    }

    abstract storable(): StorableBaseLesson;
    abstract getType(): string;

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.words.length) {
            this.pos = 0;
        }

        return { done: false, value: this.words[this.pos++] }
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }


    getChild(): Lesson | undefined {
        return undefined;
    }


    getName(_: Language): string {
        return this.name;
    }

    baseLesson(): BaseLesson {
        return this;
    }

    batch(n: number): string[] {
        let words: string[] = []
        for (let i = 0, p = this.pos; i < n; i++, p = p + 1 % this.words.length) {
            words.push(this.words[p]);
        }
        this.pos += n;
        return words;
    }

    lessonEnd(): void {  }
}
