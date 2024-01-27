import { get, user_lessons_store } from "$lib/db";
import type { Config } from "$lib/types/config";
import { BaseWordList, type StorableBaseWordList } from "./wordlist";
import { Lesson, type StorableBaseLesson } from "../lesson";

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

export async function loadUserLesson(config: Config, db: IDBDatabase, id: string, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const err = () => { throw new Error(`Could not find lesson ${id}`) };
    return await get<StorableBaseLesson, Promise<Lesson>, Promise<Lesson>>(db, user_lessons_store, id, (res) => Lesson.deserializeAndBuild(id, res, config, db, fetchFn), err, err);
}
