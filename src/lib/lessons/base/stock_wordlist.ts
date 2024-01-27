import { base } from "$app/paths";

import { BaseWordList, type StorableBaseWordList } from "./wordlist";
import { wordlist_typeid } from "$lib/conf/lesson_types";

// filename is the json file located within data/words/
export type StorableStockList = { type: typeof wordlist_typeid, filename: string } & StorableBaseWordList;

export class StockWordList extends BaseWordList {
    static getTypeId(): string {
        return wordlist_typeid;
    }

    constructor(words: string[], id: string, name: string, lang: string) {
        super(words, id, name, lang);
    }


    getType(): string {
        return wordlist_typeid;
    }

    storable(): StorableStockList {
        return {
            type: wordlist_typeid,
            id: this.id,
            name: this.name,
            lang: this.lang,
            filename: this.id,
        };
    }

    static async fromStorable(s: StorableStockList, fetchFn: typeof fetch = fetch): Promise<StockWordList> {
        const req = new Request(`${base}/data/words/${s.filename}`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((words: string[]) => {
                return new StockWordList(words, s.id, s.name, s.lang);
            });
    }

    static newStorable(id: string, name: string, lang: string, filename: string): StorableStockList {
        return { type: wordlist_typeid, id, filename, name, lang }
    }
}
