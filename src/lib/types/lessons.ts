import type { CheckMode } from "$lib/types/types";
import type { BaseLesson, Lesson } from "$lib/lessons/lesson";

/**
 * Specifies the lesson options for the wrapper classes.
 */
export type LessonWrapperConfig = {
    random: boolean,
    until: number | null,
    adaptive: boolean,
};

/**
 * Specifies the basic lesson options
 */
export type LessonBasicConfig = {
    wordBatchSize: number,
    minQueue: number,
    checkMode: CheckMode,
    backspace: boolean,
    spaceOptional: boolean
};

/**
 * Specifies all of the available lesson options by combining {@link LessonBasicConfig} and {@link LessonWrapperConfig}
 */
export type LessonTypingConfig = LessonWrapperConfig & LessonBasicConfig;

/**
 * Specifies an `id` field which must be present in a lesson-s {@link StorableLesson} if it also implements {@link BaseLesson}
 */
export interface StorableBaseLesson extends StorableLesson {
    id: string;
    name: string;
}

/**
 * Types implementing this interface will hold a {@link Lesson}'s serialized data
 */
export interface StorableLesson {
    type: string;
}
