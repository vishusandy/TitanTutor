import type { LessonTypingConfig } from "../lessons/lesson";

export type UserValue<T> = T | 'user';

export type FormUserValue<T> = UserValue<T> | 'disabled';

export type FormUserValueReturn<T> = T | undefined;

export type LessonFormState = { [P in keyof LessonTypingConfig]: FormUserValue<LessonTypingConfig[P]> };

/// enabled | disabled | forced(T)
export type OptAvailable<T> = 'enabled' | 'disabled' | T;

export type LessonOptsAvailable = { [K in keyof LessonTypingConfig]: OptAvailable<LessonTypingConfig[K]> };

export const defaultLessonFormState: LessonFormState = {
    random: 'user',
    until: 'user',
    checkMode: 'user',
    backspace: 'user',
    wordBatchSize: 'user',
    minQueue: 'user',
    spaceOptional: 'user',
    adaptive: 'user',
};

export const defaultLessonOptsAvail: LessonOptsAvailable = {
    random: 'enabled',
    until: 'enabled',
    checkMode: 'enabled',
    backspace: 'enabled',
    wordBatchSize: 'enabled',
    minQueue: 'enabled',
    spaceOptional: 'enabled',
    adaptive: 'enabled',
};

export function mergeOptsAvail(a: LessonOptsAvailable, b: LessonOptsAvailable) {
    let k: keyof typeof defaultLessonOptsAvail;
    let out: LessonOptsAvailable = { ...a };

    for (k in defaultLessonOptsAvail) {
        if (a[k] === b[k]) {
            continue;
        }
        if (a[k] === 'enabled') {
            // @ts-ignore
            out[k] = b[k];
        } else if (b[k] !== 'enabled' && a[k] !== b[k]) {
            console.warn(`merge error: cannot merge two overridden values for field ${k}`, a[k], b[k]);
        }
    }

    return out;
}

