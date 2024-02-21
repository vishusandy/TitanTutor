import type { BasicConfigProps } from "$lib/types/config";
import { CheckMode } from "$lib/types/types";

export const defaultUserId = 'default';

export const configDefaultValues: BasicConfigProps = {
    user: defaultUserId,
    lastLesson: null,
    version: 1,
    checkMode: CheckMode.WordRepeat,
    backspace: true,
    wordBatchSize: 50,
    minQueue: 20,
    stop: 'F7',
    pause: 'F4',
    logStats: true,
    spaceOptional: false,
    random: true,
    until: 100,
    adaptive: false
};
