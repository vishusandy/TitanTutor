import { Lesson, type StorableLesson, type BaseLesson } from "$lib/lessons/lesson";
import type { Config } from "$lib/types/config";
import { defaultLessonOptsAvail, mergeOptsAvail, type LessonFormState, type LessonOptsAvailable } from "$lib/types/forms";
import { defaultBatch } from "$lib/util/util";

const typeid = "until";
export type StorableUntil = { type: typeof typeid, max: number, lesson: StorableLesson };

export class UntilN implements Lesson {
    lesson: Lesson;
    num: number;
    max: number;

    static getTypeId(): string {
        return typeid;
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
            type: typeid,
            max: this.max,
            lesson: this.lesson.storable(),
        };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    static async fromStorable(s: StorableUntil, fetchFn: typeof fetch = fetch): Promise<UntilN> {
        const lesson = await Lesson.deserialize(s.lesson, fetchFn);
        return new UntilN(lesson, s.max);
    }

    static newStorable(s: StorableLesson, max: number): StorableUntil {
        return { type: typeid, max, lesson: s }
    }

    getChild(): Lesson | undefined {
        return this.lesson;
    }

    getType(): string {
        return typeid;
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

    static fromForm(lesson: Lesson, config: Config, form: LessonFormState): Lesson {
        const ovr = lesson.overrides().until;
        if (ovr === 'disabled' || ovr === null) return lesson;

        if (typeof ovr === 'number') {
            return new UntilN(lesson, ovr);
        }
        if (typeof form.until === 'number') {
            return new UntilN(lesson, form.until);
        }
        if (form.until === 'user' && typeof config.until === 'number') {
            return new UntilN(lesson, config.until);
        }

        return lesson;
    }

    lessonEnd(): void { }

}
