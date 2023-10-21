import { type WordListBase, type Lesson, type BaseLesson, deserializeStorable, type StorableLesson } from "$lib/lessons/lessons";
import type { LessonFormState } from "$lib/forms";
import { shuffle, defaultBatch } from "$lib/util";

export type StorableRandom = { type: "random", base: StorableLesson };

export class RandomList implements Lesson {
    base: WordListBase;

    constructor(base: WordListBase) {
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

    storable(): StorableRandom {
        return {
            type: 'random',
            base: this.base.storable(),
        };
    }

    static async fromStorable(s: StorableRandom, fetchFn: typeof fetch = fetch): Promise<RandomList> {
        const base = await deserializeStorable(s.base, fetchFn);
        return new RandomList(base as WordListBase);
    }
    
    static newStorable(lesson: StorableLesson): StorableRandom {
        return { type: 'random', base: lesson };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    setFormState(state: LessonFormState): void {
        state.random = true;
    }

    getChild(): Lesson | undefined {
        return this.base;
    }

    getType(): string {
        return 'random';
    }

    baseLesson(): BaseLesson {
        return this.base;
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }
};
