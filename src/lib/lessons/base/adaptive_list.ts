import { Lesson, type BaseLesson } from "$lib/lessons/lesson";
import type { StorableBaseLesson } from "../../types/lessons";
import { defaultBatch, uniqueChars } from "$lib/util/util";
import type { Language } from "$lib/data/language";
import type { BaseWordList } from "./wordlist";
import type { Config } from "$lib/config";
import { BinaryTree } from "$lib/util/bst";
import { defaultLessonOptsAvail, mergeOptsAvail, type LessonOptsAvailable, type LessonFormState } from "$lib/types/forms";
import type { UserWordList } from "./user_wordlist";
import { adaptive_store, get, save } from "$lib/db";
import { adaptive_typeid, userwordlist_typeid, wordlist_typeid } from "$lib/conf/lesson_types";
import { CheckMode } from "$lib/types/types";
import type { WordState } from "$lib/word_state";
import type { LessonStats } from "$lib/stats";
import { Action } from "$lib/types/types";
import { checkWordEnd } from "$lib/util/typing";

export type StorableAdaptive = { type: typeof adaptive_typeid, base: StorableBaseLesson };

export type TypoList = [string, number][];

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
    private typos: TypoList;
    wordProbTree: BinaryTree<string, number>;

    constructor(base: BaseWordList, typos: TypoList) {
        this.pos = 0;
        this.base = base;
        this.typos = typos;
        this.typoMap = new Map(typos);
        this.wordProbTree = AdaptiveList.newWordProbTree(this.base.words, typos);
    }

    static getTypeId(): string {
        return adaptive_typeid;
    }

    static async loadTypos(base: BaseWordList | UserWordList, db: IDBDatabase): Promise<TypoList> {
        // const def = () => { return { lesson_id: '', typos: emptyTypoList((base as BaseWordList).words) } };
        // const a = await getCallback(db, adaptive_store, base.id, (r: TypoData) => r, def, def);
        // return a.typos;

        const data = await get<TypoData>(db, adaptive_store, base.id);
        if (data === undefined) {
            return emptyTypoList((base as BaseWordList).words);
        }
        return data.typos;

    }

    saveTypos(db: IDBDatabase, lesson_id: string) {
        const typos: TypoList = [];
        for (let a of this.typoMap.entries()) {
            typos.push(a);
        }
        save(db, adaptive_store, { lesson_id, typos });
    }

    // addTypos(word: WordState) {
    //     const m = Math.min(word.wordChars.length, word.inputChars.length);
    //     const mx = Math.max(word.wordChars.length, word.inputChars.length);
    //     let ic: string, wc: string, r: number | undefined;
    //     for (let i = 0; i < m; i++) {
    //         wc = word.wordChars[i];
    //         ic = word.inputChars[i];
    //         if (wc !== ic) {
    //             r = this.typoMap.get(wc);
    //             if (r === undefined) {
    //                 this.typoMap.set(wc, 1);
    //             } else {
    //                 this.typoMap.set(wc, r + 1);
    //             }
    //         }
    //     }
    //     for (const c of word.inputChars) {

    //     }
    // }


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

        return BinaryTree.newProportionedNormalized(arr);
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
            type: adaptive_typeid,
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
        return adaptive_typeid;
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

        if (lesson.getType() !== wordlist_typeid && lesson.getType() !== userwordlist_typeid) {
            return lesson;
        }

        if (ovr === true || (ovr === 'enabled' && (form.adaptive === true || (form.adaptive === 'user' && config.adaptive === true)))) {
            const typos = await AdaptiveList.loadTypos(lesson as BaseWordList, db);
            return new AdaptiveList(lesson.baseLesson() as BaseWordList, typos);
        }

        return lesson;
    }


    processInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats) {
        if (e.inputType === 'deleteContentBackward' && config.backspace === true) {
            e.preventDefault();
            return (word.addBackspace(config.backspace)) ? Action.Refresh : Action.None;
        }

        if (e.inputType !== 'insertText') {
            e.preventDefault();
            return Action.None;
        }

        return this.processChars(e, config, word, stats);
    }

    processChars(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action {
        if (!e.data) return Action.None;

        let act = Action.None;

        // allow multiple chars (eg mobile input)
        for (const c of [...e.data]) {
            const mapped = config.remap.get(c);
            if (mapped === ' ') {
                act |= checkWordEnd({ key: ' ', preventDefault: () => { } }, config, word, stats);
            } else if (mapped !== undefined) {
                word.input += mapped;
                word.inputChars = [...word.input];
                word.state = word.mapState();
                if (word.inputChars.length <= word.wordChars.length) {
                    const i = word.inputChars.length - 1;
                    const char = word.inputChars[i];
                    if (char !== word.wordChars[i]) {
                        const count = this.typoMap.get(char);
                        this.typoMap.set(char, (count !== undefined) ? count + 1 : 1);
                        word.uncorrectedErrors += 1;
                    }
                } else {
                    word.uncorrectedErrors += 1;
                }
                act |= Action.CharAdded | Action.Refresh;
            }
        }

        if (act != Action.None) {
            word.addKeystroke();
            e.preventDefault();
        }

        return act;
    }


    // Process character input
    handleInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action {
        return this.processInput(e, config, word, stats);
    }


    // Check for backspace/space/end of word
    handleKeydown(e: KeyboardEvent, config: Config, word: WordState, stats: LessonStats): Action {
        return checkWordEnd(e, config, word, stats);
    }
}

