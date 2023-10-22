import { type Lesson, type BaseLesson, deserializeStorable, type StorableLesson } from "$lib/lessons/lessons";
import type { LessonFormState } from "$lib/forms";
import { shuffle, defaultBatch } from "$lib/util";
import type { BaseWordList } from "../base/wordlist_base";

export type StorableRandom = { type: "random", base: StorableLesson };

export class RandomList implements Lesson {
    base: BaseWordList;
    words: string[];
    pos: number;

    constructor(base: BaseWordList) {
        this.pos = 0;
        this.words = shuffle(base.words);;
        this.base = base;
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

    storable(): StorableRandom {
        return {
            type: 'random',
            base: this.base.storable(),
        };
    }

    static async fromStorable(s: StorableRandom, fetchFn: typeof fetch = fetch): Promise<RandomList> {
        const base = await deserializeStorable(s.base, fetchFn);
        return new RandomList(base as BaseWordList);
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
