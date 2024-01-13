import { Lesson, type BaseLesson, type StorableBaseLesson } from "$lib/lessons/lesson";
import { defaultBatch } from "$lib/util/util";
import type { Language } from "$lib/data/language";
import type { BaseWordList } from "./wordlist";
import { storagePrefix } from "$lib/types/config";
import { BinaryTree } from "$lib/util/bst";
import { defaultLessonOptsAvail, type LessonOptsAvailable } from "$lib/types/forms";

const lessonTypoPrefix = `${storagePrefix}lesson_typos`;

const typeid = "adaptive"
export type StorableAdaptive = { type: typeof typeid, base: StorableBaseLesson };

export class AdaptiveList implements Lesson {
    base: BaseWordList;
    pos: number;
    typos: Map<string, number>;
    wordProbTree: BinaryTree<string, number>;

    static getTypeId(): string {
        return typeid;
    }

    constructor(base: BaseWordList) {
        this.pos = 0;
        this.base = base;

        const s = localStorage.getItem(lessonTypoPrefix + base.id);
        const typoFreq: [string, number][] = s !== null ? JSON.parse(s) : Array.from(base.words.map(w => [w, 0]));
        this.typos = new Map(typoFreq);
        this.wordProbTree = AdaptiveList.newWordProbTree(this.base.words, typoFreq);
    }

    save() {
        const s = JSON.stringify(Array.from(this.typos.entries()));
        localStorage.setItem(lessonTypoPrefix + this.base.id, s);
    }

    /**
     * Creates a new binary tree representing the probability of encountering each word.
     * The sum of word probabilities in the binary tree is 1.
     * 
     * @param wordlist - List of words
     * @param typoFreq - Array of (char, typo count) tuples
     * @returns - Binary tree that represents the probability of each word.
     */
    private static newWordProbTree(wordlist: string[], typoFreq: [string, number][]): BinaryTree<string, number> {
        const charProb: Map<string, number> = new Map(AdaptiveList.charProb(typoFreq));
        const arr: [string, number][] = [];
        let sum = 0;

        wordlist.forEach((w) => {
            let p = 0;
            for (const c of [...w]) {
                p += charProb.get(c) ?? 0;
            }
            arr.push([w, p]);
            sum += p;
        });

        return BinaryTree.normalized_cumulative(arr, sum);
    }

    /**
     * Calculate the probability of encountering a given character.
     *
     *   Formula:
     *       ( n / (sum*factor) + (1-1/factor) ) / ( length * (1-1/factor) + 1/factor )
     *   where:
     *       n = num of typos for a given char,
     *       sum = total number of typos,
     *       factor = number to apply to ensure characters without typos do not get a probability of 0 (or NaN value)
     *   
     *   @param {[string, number][]} typos - Array of (char, typo count) tuples
     *   @param {number} factor - Lower factor means probabilities are more affected by typo count.  Must be above 1 to prevent NaN values.
     *   @returns {[string, number]} An array of (char, probability) tuples
     */
    private static charProb(typos: [string, number][], factor: number = 2): [string, number][] {
        const arr: [string, number][] = [];
        const typoSum = typos.reduce((acc, [, e]) => acc + e, 0);

        //    note: reciprocals are used in tf and d to eliminate division in the character loop for performance
        const tf = 1 / (typoSum * factor);
        const a = 1 - 1 / factor;
        const d = 1 / (typos.length * a + 1 / factor);

        typos.forEach(([s, n]) => arr.push([s, (n * tf + a) * d]));
        return arr;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.base.words.length)
            return { done: true, value: undefined };

        this.pos += 1;
        return { done: false, value: this.wordProbTree.search(Math.random()) };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    storable(): StorableAdaptive {
        return {
            type: typeid,
            base: this.base.storable(),
        };
    }

    static async fromStorable(s: StorableAdaptive, fetchFn: typeof fetch = fetch): Promise<AdaptiveList> {
        const base = await Lesson.deserialize(s.base, fetchFn);
        return new AdaptiveList(base as BaseWordList);
    }

    getChild(): Lesson | undefined {
        return undefined;
    }

    getType(): string {
        return typeid;
    }

    getName(_: Language): string {
        return this.baseLesson().name;
    }

    baseLesson(): BaseLesson {
        return this.base.baseLesson();
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

    overrides(): LessonOptsAvailable {
        return defaultLessonOptsAvail;
    }

    lessonEnd(): void {
        this.save();
    }
}
