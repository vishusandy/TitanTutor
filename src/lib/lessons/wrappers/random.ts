import { type BaseLesson, type Lesson, retrieveFromStorable, type StorableLesson } from "$lib/lessons/lessons";
import { shuffle, defaultBatch } from "$lib/util";

export type StorableRandom = { type: "random", base: StorableLesson };

export class RandomList implements Lesson {
    base: BaseLesson;

    constructor(base: BaseLesson) {
        this.base = base;
    }

    baseType(): string {
        return 'random';
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

    storable(): StorableRandom {
        return {
            type: 'random',
            base: this.base.storable(),
        };
    }

    static async fromStorable(s: StorableRandom, fetchFn: typeof fetch = fetch): Promise<RandomList> {
        const base = await retrieveFromStorable(s.base, fetchFn);
        return new RandomList(base as BaseLesson);
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    getLessonName(): string {
        return this.base.lessonName;
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }
};
