import { type Lesson, type StorableLesson, deserializeStorable, type BaseLesson } from "$lib/lessons/lessons";
import type { LessonFormState } from "$lib/forms";
import { defaultBatch } from "$lib/util";

export type StorableUntil = { type: "until", max: number, lesson: StorableLesson };

export class UntilN implements Lesson {
    lesson: Lesson;
    num: number;
    max: number;

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
            type: 'until',
            max: this.max,
            lesson: this.lesson.storable(),
        };
    }

    toJSON(): string {
        return JSON.stringify(this.storable());
    }

    static async fromStorable(s: StorableUntil, fetchFn: typeof fetch = fetch): Promise<UntilN> {
        const lesson = await deserializeStorable(s.lesson, fetchFn);
        return new UntilN(lesson, s.max);
    }

    static newStorable(s: StorableLesson, max: number): StorableUntil {
        return { type: 'until', max, lesson: s }
    }

    setFormState(state: LessonFormState): void {
        state.until = this.max;
    }

    getChild(): Lesson | undefined {
        return this.lesson;
    }

    getType(): string {
        return 'until';
    }

    baseLesson(): BaseLesson {
        return this.lesson.baseLesson();
    }

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

}
