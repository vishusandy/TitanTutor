import type { Lesson } from "$lib/lessons/lessons";

export class BaseLesson implements Lesson {
    words: string[];
    pos: number = 0;

    constructor(words: string[]) {
        if (words.length === 0) {
            throw new Error("Invalid pregenerated word list: the list must contain at least one element");
        }

        this.words = words;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.words.length) {
            this.pos = 0;
        }

        return { done: false, value: this.words[this.pos++] }
    }

    batch(n: number): string[] {
        let words: string[] = []

        for (let i = 0, p = this.pos; i < n; i++, p = p + 1 % this.words.length) {
            words.push(this.words[p]);
        }

        return words;
    }
};
