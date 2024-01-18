import { Lesson, type BaseLesson, type StorableLesson } from "$lib/lessons/lesson";
import { defaultLessonOptsAvail, mergeOptsAvail, type LessonFormState, type LessonOptsAvailable } from "$lib/types/forms";
import { shuffle, defaultBatch } from "$lib/util/util";
import type { BaseWordList } from "../base/wordlist";

const typeid = "random";
export type StorableRandom = { type: typeof typeid, base: StorableLesson };

export class RandomList implements Lesson {
    base: BaseWordList;
    words: string[];
    pos: number;

    static getTypeId(): string {
        return typeid;
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
            type: typeid,
            base: this.base.storable(),
        };
    }

    static async fromStorable(s: StorableRandom, fetchFn: typeof fetch = fetch): Promise<RandomList> {
        const base = await Lesson.deserialize(s.base, fetchFn);
        return new RandomList(base as BaseWordList);
    }

    static newStorable(lesson: StorableLesson): StorableRandom {
        return { type: typeid, base: lesson };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    getChild(): Lesson | undefined {
        return this.base;
    }

    getType(): string {
        return typeid;
    }

    baseLesson(): BaseLesson {
        return this.base;
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

    overrides(): LessonOptsAvailable {
        return mergeOptsAvail(this.base.overrides(), defaultLessonOptsAvail);
    }

    lessonEnd(): void { }
};
