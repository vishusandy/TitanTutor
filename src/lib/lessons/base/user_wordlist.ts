import { BaseWordList, type StorableBaseWordList } from "./wordlist";

export type StorableUserWordlist = { type: 'userwordlist', words: string[] } & StorableBaseWordList;

export class UserWordList extends BaseWordList {
    constructor(words: string[], id: string, name: string) {
        super(words, id, name);
    }

    getType(): string {
        return 'userwordlist'
    }

    storable(): StorableUserWordlist {
        return {
            type: 'userwordlist',
            id: this.id,
            name: this.name,
            words: this.words,
        };
    }

    static async fromStorable(s: StorableUserWordlist, _: typeof fetch = fetch): Promise<UserWordList> {
        return new UserWordList(s.words, s.id, s.name);
    }

    static newStorable(id: string, name: string, words: string[]): StorableUserWordlist {
        return { type: 'userwordlist', id, name, words }
    }
}
