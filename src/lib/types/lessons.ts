import type { CheckMode } from "$lib/types/config";

type LessonWrapperConfig = {
    random: boolean,
    until: number | null,
    adaptive: boolean,
};

export type LessonTypingConfig = LessonWrapperConfig & {
    wordBatchSize: number,
    minQueue: number,
    checkMode: CheckMode,
    backspace: boolean,
    spaceOptional: boolean
};

export interface StorableBaseLesson extends StorableLesson {
    id: string;
}

export interface StorableLesson {
    type: string;
}
