import type { BasicConfigProps } from "$lib/types/config";
import { CheckMode } from "$lib/types/types";
import { hasTouchScreen } from "$lib/util/device";

export const defaultUserId = 'default';

export const virtualKeyboard = hasTouchScreen();

export const configDefaultValues: BasicConfigProps = {
    user: defaultUserId,
    lastLesson: null,
    checkMode: CheckMode.Char,
    backspace: true,
    wordBatchSize: 50,
    minQueue: 20,
    shortcuts: { stop: 'F7', pause: 'F4' },
    logStats: true,
    caseSensitive: !virtualKeyboard,
    nextCustomId: 1,
    spaceOptional: false,
    random: true,
    until: 100,
    adaptive: false
};
