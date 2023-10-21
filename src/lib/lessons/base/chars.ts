import prand from "pure-rand";

import type { Lesson, BaseLesson } from "$lib/lessons/lessons";
import { defaultBatch } from "$lib/util";
import { randGen } from '$lib/random'
import type { LessonFormState } from "$lib/forms";
import type { Language } from "$lib/language";


export type StorableChars = { type: "chars", id: string, name: string, chars: string[] };

export class RandomChars implements Lesson, BaseLesson {
    chars: string[];
    length: number | [number, number] = 5;
    id: string = '';
    name: string = '';
    rng: prand.RandomGenerator;

    constructor(chars: string[], id: string, name: string) {
        if (chars.length === 0) {
            throw new Error("Invalid random letter lesson: the list of characters must contain at least one element");
        }
        this.id = id;
        this.name = name;
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
            id: this.id,
            name: this.name,
            chars: this.chars,
        };
    }

    static async fromStorable(s: StorableChars, _: typeof fetch = fetch): Promise<RandomChars> {
        return new RandomChars(s.chars, s.id, s.name);
    }

    setFormState(_: LessonFormState): void { }

    getChild(): Lesson | undefined {
        return undefined;
    }

    getType(): string {
        return 'chars'
    }

    getName(_: Language): string {
        return this.name;
    }

    baseLesson(): BaseLesson {
        return this;
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

}
