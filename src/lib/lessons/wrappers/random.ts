import { Lesson, type BaseLesson } from "$lib/lessons/lesson";
import type { StorableLesson } from "../../types/lessons";
import type { Config } from "$lib/types/config";
import { defaultLessonOptsAvail, mergeOptsAvail, type LessonFormState, type LessonOptsAvailable } from "$lib/types/forms";
import { shuffle, defaultBatch } from "$lib/util/util";
import type { BaseWordList } from "../base/wordlist";
import { random_typeid, userwordlist_typeid, wordlist_typeid } from "$lib/conf/lesson_types";

export type StorableRandom = { type: typeof random_typeid, base: StorableLesson };

export class RandomList implements Lesson {
    base: BaseWordList;
    words: string[];
    pos: number;

    static getTypeId(): string {
        return random_typeid;
    }

    constructor(base: BaseWordList) {
        this.pos = 0;
        this.words = shuffle(base.words);
        this.base = base;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.words.length) {
            this.pos = 0;
            this.words = shuffle(this.words);
        }

        return { done: false, value: this.words[this.pos++] }
    }

    storable(): StorableRandom {
        return {
            type: random_typeid,
            base: this.base.storable(),
        };
    }

    static async fromStorable(s: StorableRandom, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<RandomList> {
        const base = await Lesson.deserialize(s.base, db, fetchFn);
        return new RandomList(base as BaseWordList);
    }

    static newStorable(lesson: StorableLesson): StorableRandom {
        return { type: random_typeid, base: lesson };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    getChild(): Lesson | undefined {
        return this.base;
    }

    getType(): string {
        return random_typeid;
    }

    baseLesson(): BaseLesson {
        return this.base;
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

    overrides(): LessonOptsAvailable {
        return { ...mergeOptsAvail(this.base.overrides(), defaultLessonOptsAvail), adaptive: 'disabled' };
    }

    static async fromForm(lesson: Lesson, config: Config, db: IDBDatabase, form: LessonFormState): Promise<Lesson> {
        const ovr = lesson.overrides().random;
        if (ovr === 'disabled' || ovr === false || (lesson.getType() !== wordlist_typeid && lesson.getType() !== userwordlist_typeid)) return lesson;
        if (ovr === true || form.random === true || (form.random === 'user' && config.random === true)) {
            return new RandomList(lesson.baseLesson() as BaseWordList);
        }
        return lesson;
    }
}
