import { type Lesson, type StorableLesson, deserializeStorable, type BaseLesson } from "$lib/lessons/lessons";
import type { LessonFormState } from "$lib/forms";
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
        const lesson = await deserializeStorable(s.lesson, fetchFn);
        return new UntilN(lesson, s.max);
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
