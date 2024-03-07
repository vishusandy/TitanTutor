import prand from "pure-rand";

import type { Lesson, BaseLesson } from "$lib/lessons/lesson";
import type { StorableBaseLesson } from "../../types/lessons";
import { defaultBatch } from "$lib/util/util";
import { randGen } from '$lib/util/random'
import type { LessonOptsAvailable } from "$lib/types/forms";
import type { Language } from "$lib/data/language";
import { BinaryTree } from "$lib/util/bst";
import type { Config } from "$lib/types/config";
import type { WordState } from "$lib/word_state";
import type { LessonStats } from "$lib/stats";
import type { Action } from "$lib/types/types";
import { checkWordEnd, processInput } from "$lib/util/typing";
import { chars_typeid } from "$lib/conf/lesson_types";

export type StorableChars = { type: typeof chars_typeid, name: string, lang: string, chars: string[], min: number, max: number, weights: number[] } & StorableBaseLesson;

export class RandomChars implements BaseLesson {
    chars: string[];
    min: number;
    max: number;
    id: string;
    name: string;
    lang: string;
    rng: prand.RandomGenerator;
    weights: number[];
    bst: BinaryTree<string, number>;
    len: () => number;

    static getTypeId(): string {
        return chars_typeid;
    }

    constructor(chars: [string, number][], id: string, name: string, lang: string, minChars: number = 5, maxChars: number = 5) {
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
        this.lang = lang;
        this.chars = chars.map((c) => c[0]);
        this.rng = randGen();
        this.weights = chars.map((c) => c[1]);
        this.bst = BinaryTree.newProportionedNormalized(chars);
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
            type: chars_typeid,
            id: this.id,
            name: this.name,
            lang: this.lang,
            chars: this.chars,
            min: this.min,
            max: this.max,
            weights: this.weights
        };
    }

    static async fromStorable(s: StorableChars, _: typeof fetch = fetch): Promise<RandomChars> {
        const chars: [string, number][] = s.chars.map((c, i) => [c, s.weights[i]])
        return new RandomChars(chars, s.id, s.name, s.lang, s.min, s.max);
    }

    static newStorable(id: string, name: string, lang: string, char_weights: [string, number][], min: number = 5, max: number = 5): StorableChars {
        const chars = char_weights.map((cw) => cw[0]);
        const weights = char_weights.map((cw) => cw[1]);
        return { type: chars_typeid, id, chars, name, lang, min, max, weights }
    }

    getChild(): Lesson | undefined {
        return undefined;
    }

    getType(): string {
        return chars_typeid;
    }

    getName(_: Language): string {
        return this.name;
    }

    language(): string {
        return this.lang;
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
            adaptive: 'disabled',
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

    // Process character input
    handleInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action {
        return processInput(e, config, word, stats);
    }


    // Check for backspace/space/end of word
    handleKeydown(e: KeyboardEvent, config: Config, word: WordState, stats: LessonStats): Action {
        return checkWordEnd(e, config, word, stats);
    }
}
