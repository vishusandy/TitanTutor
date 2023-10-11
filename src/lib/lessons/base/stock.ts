import { base } from "$app/paths";
import type { BaseLesson } from "$lib/lessons/lessons";

export type StorableStock = { type: "stock", lessonName: string, file: string };

export class StockWords implements BaseLesson {
    words: string[];
    pos: number = 0;
    // todo: remove default value
    lessonName: string = '';

    constructor(words: string[], lessonName: string) {
        if (words.length === 0) {
            throw new Error("Invalid pregenerated word list: the list must contain at least one element");
        }

        this.words = words;
        this.lessonName = lessonName;
    }

    baseType(): string {
        return 'stock';
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

    static newStorable(name: string, path: string): StorableStock {
        return { type: "stock", lessonName: name, file: path }
    }
    
    storable(): StorableStock {
        return {
            type: 'stock',
            lessonName: this.lessonName,
            file: this.lessonName,
        };
    }

    static async fromStorable(s: StorableStock, fetchFn: typeof fetch = fetch): Promise<StockWords> {
        const req = new Request(`${base}/data/words/${s.file}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((words: string[]) => {
                return new StockWords(words, s.lessonName);
            });
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
