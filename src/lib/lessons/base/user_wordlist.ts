import { get, user_lessons_store } from "$lib/db";
import type { Config } from "$lib/config";
import { BaseWordList, type StorableBaseWordList } from "./wordlist";
import { Lesson } from "../lesson";
import type { StorableBaseLesson } from "../../types/lessons";
import { userwordlist_typeid } from "$lib/conf/lesson_ids";

export type StorableUserWordlist = { type: typeof userwordlist_typeid, words: string[] } & StorableBaseWordList;

export class UserWordList extends BaseWordList {
    constructor(words: string[], id: string, name: string) {
        super(words, id, name, 'user');
    }

    static getTypeId(): string {
        return userwordlist_typeid;
    }

    getType(): string {
        return userwordlist_typeid;
    }

    storable(): StorableUserWordlist {
        return {
            type: userwordlist_typeid,
            id: this.id,
            name: this.name,
            lang: this.lang,
            words: this.words,
        };
    }

    static async fromStorable(s: StorableUserWordlist, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<UserWordList> {
        return new UserWordList(s.words, s.id, s.name);
    }

    static newStorable(id: string, name: string, words: string[]): StorableUserWordlist {
        return { type: userwordlist_typeid, id, name, words, lang: 'user' };
    }
}

export async function loadUserLesson(config: Config, db: IDBDatabase, id: string, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const data = await get<StorableBaseLesson>(db, user_lessons_store, id);
    if (data === undefined) {
        throw new Error(`Could not find lesson ${id}`);
    }
    return Lesson.deserializeAndBuild(id, data, config, db, fetchFn);

}
