import { BaseWordList, type StorableBaseWordList } from "./wordlist_base";

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

// export class UserWordList implements WordListBase, BaseLesson {
//     words: string[];
//     pos: number = 0;
//     id: string;
//     name: string;

//     constructor(words: string[], id: string, name: string) {
//         if (words.length === 0) {
//             throw new Error("Invalid pregenerated word list: the list must contain at least one element");
//         }

//         this.pos = 0;
//         this.words = words;
//         this.id = id;
//         this.name = name;
//     }

//     [Symbol.iterator]() {
//         return this;
//     }

//     next(): IteratorResult<string> {
//         if (this.pos >= this.words.length) {
//             this.pos = 0;
//         }

//         return { done: false, value: this.words[this.pos++] }
//     }

//     toJSON(): string {
//         return JSON.stringify(this.storable());
//     }

//     static newStorable(id: string, name: string, words: string[]): StorableUserWordlist {
//         return { type: 'userwordlist', id, name, words }
//     }

//     storable(): StorableUserWordlist {
//         return {
//             type: 'userwordlist',
//             id: this.id,
//             name: this.name,
//             words: this.words,
//         };
//     }

//     static async fromStorable(s: StorableUserWordlist, _: typeof fetch = fetch): Promise<UserWordList> {
//         return new UserWordList(s.words, s.id, s.name);
//     }

//     setFormState(_: LessonFormState): void { }

//     getChild(): Lesson | undefined {
//         return undefined;
//     }

//     getType(): string {
//         return 'userwordlist'
//     }

//     getName(_: Language): string {
//         return this.name;
//     }

//     baseLesson(): BaseLesson {
//         return this;
//     }

//     batch(n: number): string[] {
//         let words: string[] = []
//         for (let i = 0, p = this.pos; i < n; i++, p = p + 1 % this.words.length) {
//             words.push(this.words[p]);
//         }
//         this.pos += n;
//         return words;
//     }
// };
