import type { CheckMode } from "./config";

export type UserValue<T> = T | 'user';
export type UserOptional<T> = T | null | 'user';

export type FormUserValue<T> = UserValue<T> | 'disabled';
export type FormUserOptional<T> = UserOptional<T> | 'disabled';

export type FormUserValueReturn<T> = T | undefined;
export type FormUserOptionalReturn<T> = T | null | undefined;


export type LessonFormState = {
    lessonName: string,
    checkMode: FormUserValue<CheckMode>,
    backspace: FormUserValue<boolean>,
    wordBatchSize: FormUserValue<number>,
    minQueue: FormUserValue<number>,
    random: FormUserValue<boolean>;
    until: FormUserOptional<number>;
};

export const defaultLessonFormState: Omit<LessonFormState, 'lessonName'> = {
    random: 'user',
    until: 'user',
    checkMode: 'user',
    backspace: 'user',
    wordBatchSize: 'user',
    minQueue: 'user',
};

