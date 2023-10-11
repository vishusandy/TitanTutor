import { shuffle } from "weighted-shuffle";
import { type Lesson, type BaseLesson, type StorableLesson, retrieveFromStorable } from "$lib/lessons/lessons";
import { defaultBatch } from "$lib/util";
import { storagePrefix } from "$lib/config";

type Weights = number[] | string;

export type StorableWeighted = {
    type: "weighted",
    weights: Weights,
    base: StorableLesson;
};

export class WeightedList implements Lesson {
    words: [string, number][];
    pos: number = 0;
    base: BaseLesson;

    constructor(base: BaseLesson, weights: Weights | undefined) {
        if (base.words.length === 0) {
            throw new Error("Invalid weighted word list: the list must contain at least one element");
        }

        if (weights !== undefined && base.words.length !== weights.length) {
            throw new Error(`Invalid weighted word list: mismatched lengths - words=${base.words.length} vs weights=${weights.length}`);
        }

        this.base = base;

        if (weights === undefined) {
            const p = 1 / base.words.length;
            this.words = base.words.map((w, i) => [w, p]);
        } else if (typeof weights === 'string') {
            // const w = localStorage.getItem(`${storagePrefix}lesson_${base.lessonName}_weights`);
            throw new Error("localStorage weights are not yet supported");
        } else {
            this.words = base.words.map((w, i) => [w, weights[i]]);
        }

        this.shuffle();
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.words.length) {
            this.pos = 0;
            this.shuffle();
        }

        return { done: false, value: this.words[this.pos++][0] }
    }

    storable(): StorableWeighted {
        return {
            type: 'weighted',
            weights: Array.from(this.words.map(([_, weight]) => weight)),
            base: this.base.storable(),
        };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    async deserialize(s: string) {
        let o = JSON.parse(s);

    }
    static async fromStorable(s: StorableWeighted, fetchFn: typeof fetch = fetch): Promise<WeightedList> {
        const base = await retrieveFromStorable(s.base, fetchFn);
        return new WeightedList(base as BaseLesson, s.weights)
    }

    getLessonName(): string {
        return this.base.lessonName;
    }
    
    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

    shuffle() {
        this.words = shuffle(this.words);
    }
};
