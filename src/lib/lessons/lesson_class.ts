import type { Config } from '$lib/config';
import type { LessonFormState } from '$lib/types/forms';
import type { Lesson } from '$lib/lessons/lesson';
import type { Language } from '../data/language';
import type { StorableLesson } from '$lib/types/lessons';


export type wrapperBuilderType = (lesson: Lesson, config: Config, db: IDBDatabase, form: LessonFormState) => Promise<Lesson>;
export type storableFnType<S extends StorableLesson, L extends Lesson> = (s: S, db: IDBDatabase, fetchFn: typeof fetch) => Promise<L>;
export type nameFnType = ((lang: Language) => string);

export class LessonClass {
    classId: string;
    nameFn: ((lang: Language) => string);
    storableFn: storableFnType<StorableLesson, Lesson>;
    wrapperBuilder: wrapperBuilderType | undefined = undefined;

    constructor(classId: string, nameFn: nameFnType, fromStorableFn: storableFnType<any, any>) {
        this.classId = classId;
        this.nameFn = nameFn.bind(this);
        this.storableFn = fromStorableFn;
    }

    name(lang: Language): string {
        return this.nameFn(lang);
    }

    fromStorable(s: StorableLesson, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        return this.storableFn(s, db, fetchFn);
    }
}

export class WrapperClass extends LessonClass {
    constructor(classId: string, nameFn: nameFnType, fromStorableFn: storableFnType<any, any>, wrapper: wrapperBuilderType) {
        super(classId, nameFn, fromStorableFn);
        this.wrapperBuilder = wrapper;
    }
}

