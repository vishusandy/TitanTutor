import { BaseWordList, type StorableBaseWordList } from "./wordlist";

const typeid = "userwordlist"
export type StorableUserWordlist = { type: typeof typeid, words: string[] } & StorableBaseWordList;

export class UserWordList extends BaseWordList {
    constructor(words: string[], id: string, name: string) {
        super(words, id, name);
    }

    static getTypeId(): string {
        return typeid;
    }

    getType(): string {
        return typeid;
    }

    storable(): StorableUserWordlist {
        return {
            type: typeid,
            id: this.id,
            name: this.name,
            words: this.words,
        };
    }

    static async fromStorable(s: StorableUserWordlist, _: typeof fetch = fetch): Promise<UserWordList> {
        return new UserWordList(s.words, s.id, s.name);
    }

    static newStorable(id: string, name: string, words: string[]): StorableUserWordlist {
        return { type: typeid, id, name, words }
    }
}
