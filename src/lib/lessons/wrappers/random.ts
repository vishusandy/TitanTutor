import type { BaseLesson, Lesson } from "$lib/lessons/lessons";
import { shuffle, defaultBatch } from "$lib/util";

export class RandomList implements Lesson {
    base: BaseLesson;

    constructor(base: BaseLesson) {
        this.base = base;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.base.pos >= this.base.words.length) {
            this.base.pos = 0;
            this.base.words = shuffle(this.base.words);
        }

        return { done: false, value: this.base.words[this.base.pos++] }
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }
};
