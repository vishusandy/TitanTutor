import { type Lesson, type StorableLesson, retrieveFromStorable } from "$lib/lessons/lessons";
import { defaultBatch } from "$lib/util";

export type StorableUntil = { type: "until", max: number, lesson: StorableLesson };

export class UntilN implements Lesson {
    lesson: Lesson;
    pos: number = 0;
    max: number;

    constructor(lesson: Lesson, max: number) {
        this.lesson = lesson;
        this.max = max;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        if (this.pos >= this.max) {
            return { done: true, value: undefined };
        }

        return this.lesson.next();
    }

    storable(): StorableUntil {
        return {
            type: 'until',
            max: this.max,
            lesson: this.lesson.storable(),
        };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    static async fromStorable(s: StorableUntil, fetchFn: typeof fetch = fetch): Promise<UntilN> {
        const lesson = await retrieveFromStorable(s.lesson, fetchFn);
        return new UntilN(lesson, s.max);
    }

    getLessonName(): string {
        return this.lesson.getLessonName();
    }
    
    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

}
