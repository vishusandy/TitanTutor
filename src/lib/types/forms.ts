import type { LessonTypingConfig } from "../lessons/lesson";

export type UserValue<T> = T | 'user';
export type FormUserValue<T> = UserValue<T> | 'disabled';
export type FormUserValueReturn<T> = T | undefined;


export type LessonFormState = { [P in keyof LessonTypingConfig]: FormUserValue<LessonTypingConfig[P]> };

export const defaultLessonFormState: LessonFormState = {
    random: 'user',
    until: 'user',
    checkMode: 'user',
    backspace: 'user',
    wordBatchSize: 'user',
    minQueue: 'user',
    spaceOptional: false,
};

