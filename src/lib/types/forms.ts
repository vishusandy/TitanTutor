import type { LessonTypingConfig } from "./lessons";

/**
 * Enable/disable a specific lesson option with `"enabled"` / `"disabled"`  or force a set value by using the a value of type `T`.
 */
export type OptAvailable<T> = 'enabled' | 'disabled' | T;

/**
 * Helper type to allow a type to inherit a value from the user settings by specifying "inherit" as the value.
 * 
  * `UserValue<T>` expands to: `T | "inherit"`
 */
export type UserValue<T> = T | 'inherit';

/**
 * Helper type that extends {@link UserValue} by allowing the string "disabled" to specify that it cannot be used.
 * 
 * `FormUserValue<T>` expands to: `T | "inherit" | "disabled"`
 */
export type FormUserValue<T> = UserValue<T> | 'disabled';

/**
 * Helper type that extends `FormUserValue` by allowing undefined to specify that no value was specified in the
 * 
 * FormValueReturn<T>` expands to: `T | undefined`
 */
export type FormValueReturn<T> = T | undefined;

/**
 * Automatically generated type that wraps all fields of {@link LessonTypingConfig} in a {@link UserValue} (allowing for it to inherit a value from the user-settings).
 */
export type LessonFormState = { [P in keyof LessonTypingConfig]: UserValue<LessonTypingConfig[P]> };

/**
 * Automatically generated type that wraps all fields of {@link LessonTypingConfig} in a {@link OptAvailable} (allowing each option to be enabled/disabled or forced to a specific value)
 */
export type LessonOptsAvailable = { [K in keyof LessonTypingConfig]: OptAvailable<LessonTypingConfig[K]> };

export const defaultLessonFormState: LessonFormState = {
    random: 'inherit',
    until: 'inherit',
    checkMode: 'inherit',
    backspace: 'inherit',
    wordBatchSize: 'inherit',
    minQueue: 'inherit',
    spaceOptional: 'inherit',
    adaptive: 'inherit',
    caseSensitive: 'inherit',
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
    caseSensitive: 'enabled'
};

/** 
 * Merges two {@link LessonOptsAvailable}s into a new {@link LessonOptsAvailable}.
 * 
 * If one of the two parameter's values is 'enabled' the value from the other is used.
 * 
 * Issues a warning to the console if an incompatible combination of values is used.
 */
export function mergeOptsAvail(a: LessonOptsAvailable, b: LessonOptsAvailable): LessonOptsAvailable {
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

