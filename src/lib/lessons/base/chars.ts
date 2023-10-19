import prand from "pure-rand";

import { Lesson } from "$lib/lessons/lessons";
import { defaultBatch } from "$lib/util";
import { randGen } from '$lib/random'
import type { LessonFormState } from "$lib/forms";


export type StorableChars = { type: "chars", lessonName: string, chars: string[] };

export class RandomChars extends Lesson {
    chars: string[];
    length: number | [number, number] = 5;
    lessonName: string = '';
    rng: prand.RandomGenerator;

    constructor(chars: string[], lessonName: string) {
        super();
        if (chars.length === 0) {
            throw new Error("Invalid random letter lesson: the list of characters must contain at least one element");
        }
        this.lessonName = lessonName;
        this.chars = chars;
        this.rng = randGen();
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        let length: number, n: number, chars: string = '';

        if (Array.isArray(this.length)) {
            length = prand.unsafeUniformIntDistribution(this.length[0], this.length[1], this.rng);
        } else {
            length = this.length;
        }

        for (let i = 0; i < length; i++) {
            n = prand.unsafeUniformIntDistribution(0, this.chars.length, this.rng);
            chars += this.chars[n];
        }

        return { done: false, value: chars }
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    storable(): StorableChars {
        return {
            type: 'chars',
            lessonName: this.lessonName,
            chars: this.chars,
        };
    }

    static async fromStorable(s: StorableChars, _: typeof fetch = fetch): Promise<RandomChars> {
        return new RandomChars(s.chars, s.lessonName);
    }

    setFormState(state: LessonFormState): void { }

    getChild(): Lesson | undefined {
        return undefined;
    }

    getLessonName(): string {
        return this.lessonName;
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

}
