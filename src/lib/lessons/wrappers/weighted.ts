import { shuffle } from "weighted-shuffle";
import type { Lesson } from "$lib/lessons/lessons";
import { defaultBatch } from "$lib/util";

export class WeightedList implements Lesson {
    words: [string, number][];
    pos: number = 0;

    constructor(words: [string, number][]) {
        if (words.length === 0) {
            throw new Error("Invalid weighted word list: the list must contain at least one element");
        }

        this.words = words;
        this.shuffle();
    }

    static new(words: string[]): WeightedList {
        const p = 1 / words.length;
        return new WeightedList(Array.from(words.map(w => [w, p])));
    }

    static with_weights(words: string[], weights: number[]): WeightedList {
        if (words.length !== weights.length) {
            throw new Error("Invalid weighted word list: number of items does not match the number of weights");
        }

        return new WeightedList(Array.from(words.map((word, i) => [word, weights[i]])));
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

    shuffle() {
        this.words = shuffle(this.words);
    }

    static deserialize(s: string): WeightedList {
        const words: [string, number][] = JSON.parse(s);

        if (!Array.isArray(words) || !words.every(a => a.length === 2 && typeof a[0] === 'string' && typeof a[1] === 'number')) {
            throw new Error("Deserialize error: invalid format");
        }

        return new WeightedList(words);
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
};
