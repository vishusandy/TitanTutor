import { base } from "$app/paths";
import type { Lesson, WordListBase } from "$lib/lessons/lessons";
import type { LessonFormState } from "$lib/forms";

export type StorableStockList = { type: 'wordlist', lessonName: string, file: string };

export class StockWordListLesson implements WordListBase {
    words: string[];
    pos: number = 0;
    lessonName: string;

    constructor(words: string[], lessonName: string) {
        if (words.length === 0) {
            throw new Error("Invalid pregenerated word list: the list must contain at least one element");
        }

        this.pos = 0;
        this.words = words;
        this.lessonName = lessonName;
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

    static newStorable(name: string, path: string): StorableStockList {
        return { type: 'wordlist', lessonName: name, file: path }
    }

    storable(): StorableStockList {
        return {
            type: 'wordlist',
            lessonName: this.lessonName,
            file: this.lessonName,
        };
    }

    static async fromStorable(s: StorableStockList, fetchFn: typeof fetch = fetch): Promise<StockWordListLesson> {
        const req = new Request(`${base}/data/words/${s.file}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((words: string[]) => {
                return new StockWordListLesson(words, s.lessonName);
            });
    }

    setFormState(state: LessonFormState): void { }

    getChild(): Lesson | undefined {
        return undefined;
    }

    baseType(): string {
        return 'wordlist'
    }

    getLessonName(): string {
        return this.lessonName;
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
