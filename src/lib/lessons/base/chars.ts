import prand from "pure-rand";

import type { Lesson, BaseLesson, StorableBaseLesson } from "$lib/lessons/lesson";
import { defaultBatch } from "$lib/util/util";
import { randGen } from '$lib/util/random'
import type { LessonFormState, LessonOptsAvailable } from "$lib/types/forms";
import type { Language } from "$lib/data/language";
import { BinaryTree } from "$lib/util/bst";
import { CheckMode, Config } from "$lib/types/config";

const typeid = "chars";
export type StorableChars = { type: typeof typeid, name: string, chars: string[], min: number, max: number, weights: number[] } & StorableBaseLesson;

export class RandomChars implements BaseLesson {
    chars: string[];
    min: number;
    max: number;
    id: string;
    name: string;
    rng: prand.RandomGenerator;
    weights: number[];
    bst: BinaryTree<string, number>;
    len: () => number;

    static getTypeId(): string {
        return typeid;
    }

    constructor(chars: [string, number][], id: string, name: string, minChars: number = 5, maxChars: number = 5) {
        if (chars.length === 0) {
            throw new Error("Invalid random letter lesson: the list of characters must contain at least one element");
        }

        if (minChars <= maxChars) {
            this.min = minChars;
            this.max = maxChars;
        } else {
            this.max = minChars;
            this.min = maxChars;
        }

        this.id = id;
        this.name = name;
        this.chars = chars.map((c) => c[0]);
        this.rng = randGen();
        this.weights = chars.map((c) => c[1]);
        this.bst = BinaryTree.normalized(chars);
        // @ts-ignore
        this.len = (minChars !== maxChars) ? () => prand.unsafeUniformIntDistribution(this.min, this.max, this.rng) : () => this.min;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        let length: number = this.len();
        let chars: string = '';

        for (let i = 0; i < length; i++) {
            chars += this.bst.search(Math.random());
        }

        return { done: false, value: chars }
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    storable(): StorableChars {
        return {
            type: typeid,
            id: this.id,
            name: this.name,
            chars: this.chars,
            min: this.min,
            max: this.max,
            weights: this.weights
        };
    }

    static async fromStorable(s: StorableChars, _: typeof fetch = fetch): Promise<RandomChars> {
        const chars: [string, number][] = s.chars.map((c, i) => [c, s.weights[i]])
        return new RandomChars(chars, s.id, s.name, s.min, s.max);
    }

    static newStorable(id: string, name: string, char_weights: [string, number][], min: number = 5, max: number = 5): StorableChars {
        const chars = char_weights.map((cw) => cw[0]);
        const weights = char_weights.map((cw) => cw[1]);
        return { type: typeid, id, chars, name, min, max, weights }
    }

    getChild(): Lesson | undefined {
        return undefined;
    }

    getType(): string {
        return typeid;
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

    overrides(): LessonOptsAvailable {
        return {
            random: true,
            until: 'enabled',
            checkMode: 'enabled',
            backspace: 'enabled',
            wordBatchSize: 'enabled',
            minQueue: 'enabled',
            spaceOptional: 'enabled',
            adaptive: 'enabled',
        };
        // return {
        //     random: false,
        //     until: null,
        //     checkMode: CheckMode.WordRepeat,
        //     backspace: false,
        //     wordBatchSize: 11,
        //     minQueue: 7,
        //     spaceOptional: true,
        //     adaptive: true,
        // };
    }

    lessonEnd(): void { }
}
