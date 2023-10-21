import { base } from "$app/paths";
import type { BaseLesson, Lesson, WordListBase } from "$lib/lessons/lessons";
import type { LessonFormState } from "$lib/forms";
import type { Language } from "$lib/language";

// filename is the json file located within data/words/ and without .json extension
export type StorableStockList = { type: 'wordlist', id: string, name: string, filename: string };

export class StockWordListLesson implements WordListBase, BaseLesson {
    words: string[];
    pos: number = 0;
    id: string;
    name: string;

    constructor(words: string[], id: string, name: string) {
        if (words.length === 0) {
            throw new Error("Invalid pregenerated word list: the list must contain at least one element");
        }

        this.pos = 0;
        this.words = words;
        this.id = id;
        this.name = name;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.words.length) {
            this.pos = 0;
        }

        return { done: false, value: this.words[this.pos++] }
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    static newStorable(id: string, filename: string, name: string): StorableStockList {
        return { type: 'wordlist', id, filename, name }
    }

    storable(): StorableStockList {
        return {
            type: 'wordlist',
            id: this.id,
            name: this.name,
            filename: this.id,
        };
    }

    static async fromStorable(s: StorableStockList, fetchFn: typeof fetch = fetch): Promise<StockWordListLesson> {
        const req = new Request(`${base}/data/words/${s.filename}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((words: string[]) => {
                return new StockWordListLesson(words, s.id, s.name);
            });
    }

    setFormState(state: LessonFormState): void { }

    getChild(): Lesson | undefined {
        return undefined;
    }

    getType(): string {
        return 'wordlist'
    }

    getName(_: Language): string {
        return this.name;
    }

    baseLesson(): BaseLesson {
        return this;
    }

    batch(n: number): string[] {
        let words: string[] = []
        for (let i = 0, p = this.pos; i < n; i++, p = p + 1 % this.words.length) {
            words.push(this.words[p]);
        }
        this.pos += n;
        return words;
    }
};
