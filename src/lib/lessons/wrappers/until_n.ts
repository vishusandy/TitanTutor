import { Lesson, type BaseLesson } from "$lib/lessons/lesson";
import type { StorableLesson } from "../../types/lessons";
import type { Config } from "$lib/config";
import { defaultLessonOptsAvail, mergeOptsAvail, type LessonFormState, type LessonOptsAvailable } from "$lib/types/forms";
import { defaultBatch } from "$lib/util/util";
import { until_typeid } from "$lib/conf/lesson_ids";
import type { WordState } from "$lib/word_state";
import type { LessonStats } from "$lib/stats";
import type { Action } from "$lib/types/types";

export type StorableUntil = { type: typeof until_typeid, max: number, lesson: StorableLesson };

export class UntilN implements Lesson {
    lesson: Lesson;
    num: number;
    max: number;

    static getTypeId(): string {
        return until_typeid;
    }

    constructor(lesson: Lesson, max: number) {
        this.lesson = lesson;
        this.max = max;
        this.num = 0;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        this.num += 1;
        if (this.num > this.max) {
            return { done: true, value: undefined };
        }
        return this.lesson.next();
    }

    storable(): StorableUntil {
        return {
            type: until_typeid,
            max: this.max,
            lesson: this.lesson.storable(),
        };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    static async fromStorable(s: StorableUntil, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<UntilN> {
        const lesson = await Lesson.deserialize(s.lesson, db, fetchFn);
        return new UntilN(lesson, s.max);
    }

    static newStorable(s: StorableLesson, max: number): StorableUntil {
        return { type: until_typeid, max, lesson: s }
    }

    getChild(): Lesson | undefined {
        return this.lesson;
    }

    getType(): string {
        return until_typeid;
    }

    baseLesson(): BaseLesson {
        return this.lesson.baseLesson();
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

    overrides(): LessonOptsAvailable {
        return mergeOptsAvail(this.lesson.overrides(), defaultLessonOptsAvail);
    }

    static async fromForm(lesson: Lesson, config: Config, db: IDBDatabase, form: LessonFormState): Promise<Lesson> {
        const ovr = lesson.overrides().until;
        if (ovr === 'disabled' || ovr === null) return lesson;

        if (typeof ovr === 'number') {
            return new UntilN(lesson, ovr);
        }
        if (typeof form.until === 'number') {
            return new UntilN(lesson, form.until);
        }
        if (form.until === 'inherit' && typeof config.until === 'number') {
            return new UntilN(lesson, config.until);
        }

        return lesson;
    }

    // Process character input
    handleInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action {
        return this.lesson.handleInput(e, config, word, stats);
    }


    // Check for backspace/space/end of word
    handleKeydown(e: KeyboardEvent, config: Config, word: WordState, stats: LessonStats): Action {
        return this.lesson.handleKeydown(e, config, word, stats);
    }
}
