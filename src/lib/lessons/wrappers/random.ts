import type { Lesson } from "$lib/lessons/lessons";
import { shuffle, defaultBatch } from "$lib/util";

export class RandomList implements Lesson {
    words: string[];
    pos: number = 0;

    constructor(words: string[]) {
        if (words.length === 0) {
            throw new Error("Invalid pregenerated random word list: the list must contain at least one element");
        }

        this.words = words;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.words.length) {
            this.pos = 0;
            this.words = shuffle(this.words);
        }

        return { done: false, value: this.words[this.pos++] }
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }
};
