import { base } from "$app/paths";
import { BaseWordList, type StorableBaseWordList } from "./wordlist";

// filename is the json file located within data/words/
export type StorableStockList = { type: 'wordlist', filename: string } & StorableBaseWordList;

export class StockWordList extends BaseWordList {
    constructor(words: string[], id: string, name: string) {
        super(words, id, name);
    }

    getType(): string {
        return 'wordlist'
    }

    storable(): StorableStockList {
        return {
            type: 'wordlist',
            id: this.id,
            name: this.name,
            filename: this.id,
        };
    }

    static async fromStorable(s: StorableStockList, fetchFn: typeof fetch = fetch): Promise<StockWordList> {
        const req = new Request(`${base}/data/words/${s.filename}`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((words: string[]) => {
                return new StockWordList(words, s.id, s.name);
            });
    }

    static newStorable(id: string, filename: string, name: string): StorableStockList {
        return { type: 'wordlist', id, filename, name }
    }
}
