import { get, user_lessons_store } from "$lib/db";
import type { Config } from "$lib/types/config";
import { BaseWordList, type StorableBaseWordList } from "./wordlist";
import { Lesson } from "../lesson";
import type { StorableBaseLesson } from "../../types/lessons";
import { userwordlist_typeid } from "$lib/conf/lesson_types";

export type StorableUserWordlist = { type: typeof userwordlist_typeid, words: string[] } & StorableBaseWordList;

export class UserWordList extends BaseWordList {
    constructor(words: string[], id: string, name: string, lang: string) {
        super(words, id, name, lang);
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

    static async fromStorable(s: StorableUserWordlist, _: typeof fetch = fetch): Promise<UserWordList> {
        return new UserWordList(s.words, s.id, s.name, s.lang);
    }

    static newStorable(id: string, name: string, lang: string, words: string[]): StorableUserWordlist {
        return { type: userwordlist_typeid, id, name, words, lang }
    }
}

export async function loadUserLesson(config: Config, db: IDBDatabase, id: string, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const err = () => { throw new Error(`Could not find lesson ${id}`) };
    return await get<StorableBaseLesson, Promise<Lesson>, Promise<Lesson>>(db, user_lessons_store, id, (res) => Lesson.deserializeAndBuild(id, res, config, db, fetchFn), err, err);
}
