import type { Config } from '$lib/config';
import type { LessonFormState } from '$lib/types/forms';
import type { Lesson } from '$lib/lessons/lesson';
import {
    LessonClass,
    WrapperClass
} from '$lib/lessons/lesson_class';
import { classes } from '$lib/conf/lesson_classes';

const wrappers: WrapperClass[] = classes.filter((c) => c.wrapperBuilder !== undefined);


export async function addWrappers(base: Lesson, config: Config, db: IDBDatabase, state: LessonFormState): Promise<Lesson> {
    let lesson = base;
    for (const w of wrappers) {
        lesson = await w.wrapperBuilder!(lesson, config, db, state);
    }
    return lesson;
}

export function getLessonClass(cls: string): LessonClass | undefined {
    return classes.find((c) => c.classId === cls);
}
