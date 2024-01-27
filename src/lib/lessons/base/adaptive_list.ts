import { Lesson, type BaseLesson, type StorableBaseLesson } from "$lib/lessons/lesson";
import { defaultBatch, uniqueChars } from "$lib/util/util";
import type { Language } from "$lib/data/language";
import type { BaseWordList } from "./wordlist";
import { CheckMode, Config } from "$lib/types/config";
import { BinaryTree } from "$lib/util/bst";
import { defaultLessonOptsAvail, mergeOptsAvail, type LessonOptsAvailable, type LessonFormState } from "$lib/types/forms";
import type { UserWordList } from "./user_wordlist";
import { adaptive_store, get, save } from "$lib/db";


const typeid = "adaptive"
export type StorableAdaptive = { type: typeof typeid, base: StorableBaseLesson };

type TypoList = [string, number][];

type TypoData = {
    'lesson_id': string,
    'typos': TypoList,
};

function emptyTypoList(words: string[]): TypoList {
    const arr: TypoList = [];
    const chars = uniqueChars(words);
    chars.forEach(c => arr.push([c, 1]));
    return arr;
}

export class AdaptiveList implements Lesson {
    base: BaseWordList;
    pos: number;
    typoMap: Map<string, number>;
    typos: TypoList;
    wordProbTree: BinaryTree<string, number>;

    constructor(base: BaseWordList, typos: TypoList) {
        this.pos = 0;
        this.base = base;
        this.typos = typos;
        this.typoMap = new Map(typos);
        this.wordProbTree = AdaptiveList.newWordProbTree(this.base.words, typos);
    }

    static getTypeId(): string {
        return typeid;
    }

    static async loadTypos(base: BaseWordList | UserWordList, db: IDBDatabase): Promise<TypoList> {
        const def = () => { return { lesson_id: '', typos: emptyTypoList((base as BaseWordList).words) } };
        const a = await get(db, adaptive_store, base.id, (r: TypoData) => r, def, def);
        return a.typos;
    }

    static saveTypos(db: IDBDatabase, lesson_id: string, typos: TypoList) {
        const data: TypoData = { lesson_id, typos };
        save(db, adaptive_store, data);
    }

    /**
     * Creates a new binary tree representing the probability of encountering each word.
     * The sum of word probabilities in the binary tree is 1.
     * 
     * @param wordlist - List of words
     * @param typoFreq - Array of (char, typo count) tuples
     * @returns - Binary tree that represents the probability of each word.
     */
    private static newWordProbTree(wordlist: string[], typoFreq: TypoList): BinaryTree<string, number> {
        const cp = AdaptiveList.charProb(typoFreq);
        const charProb: Map<string, number> = new Map(cp);
        const arr: TypoList = [];
        let sum = 0;

        wordlist.forEach((w) => {
            let p = 0;
            for (const c of [...w]) {
                p += (charProb.get(c) ?? 0);
            }
            arr.push([w, p]);
            sum += p;
        });

        return BinaryTree.normalized(arr);
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
     *   @param {TypoList} typos - Array of (char, typo count) tuples
     *   @param {number} factor - Lower factor means probabilities are more affected by typo count.  Must be above 1 to prevent NaN values.
     *   @returns {[string, number]} An array of (char, probability) tuples
     */
    private static charProb(typos: TypoList, factor: number = 2): TypoList {
        const arr: TypoList = [];
        const typoSum = typos.reduce((acc, [, e]) => acc + e, 0);

        const tf = 1 / (typoSum * factor);
        const a = 1 - 1 / factor;
        const d = 1 / (typos.length * a + 1 / factor);
        // console.log(`typoSum=${typoSum} tf=${tf} a=${a} d=${d}`);

        //    note: reciprocals are used in tf and d to eliminate division in the character loop for performance
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

    static async fromStorable(s: StorableAdaptive, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<AdaptiveList> {
        const base = await Lesson.deserialize(s.base, db, fetchFn);
        const typos = await AdaptiveList.loadTypos(base.baseLesson() as BaseWordList, db);
        return new AdaptiveList(base as BaseWordList, typos);
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
        return { ...mergeOptsAvail(this.base.overrides(), defaultLessonOptsAvail), random: 'disabled', checkMode: CheckMode.Char };
    }

    static async fromForm(lesson: Lesson, config: Config, db: IDBDatabase, form: LessonFormState): Promise<Lesson> {
        const ovr = lesson.overrides().adaptive;

        if (lesson.getType() !== 'wordlist' && lesson.getType() !== 'userwordlist') {
            return lesson;
        }

        if (ovr === true || (ovr === 'enabled' && (form.adaptive === true || (form.adaptive === 'user' && config.adaptive === true)))) {
            const typos = await AdaptiveList.loadTypos(lesson as BaseWordList, db);
            return new AdaptiveList(lesson.baseLesson() as BaseWordList, typos);
        }

        return lesson;
    }

    lessonEnd(): void {
        // this.save();
        // AdaptiveList.saveTypos(this.typos);
    }
}
