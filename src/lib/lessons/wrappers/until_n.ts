import type { Lesson } from "$lib/lessons/lessons";
import { defaultBatch } from "$lib/util";

export class UntilN<T extends Lesson> implements Lesson {
    lesson: Lesson;
    pos: number = 0;
    max: number;

    constructor(lesson: T, max: number) {
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

    batch(n: number): string[] {
        return defaultBatch(this, n);
    }

}
