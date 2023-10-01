// import { qwertyToDvorak } from "./mappings/qwerty_to_dvorak";
import { type Mapping, NoMap } from "./mappings";
import type { Audio } from "./audio";
import { mapLocale } from "./util";

export const enum KbTarget {
    Qwerty = 0,
    Dvorak = 1,
}

export const enum CheckMode {
    Char = 0,
    WordRepeat = 1, // redo current word if wrong
}


// ignores or accepts backspace
export const enum BackspaceMode {
    Accept = 0,
    Ignore = 1,
}

export type Config = {
    kb: KbTarget;
    mapping: Mapping;
    check_mode: CheckMode;
    backspace: BackspaceMode;
    tts?: Audio;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    lang: string[]; // array to match different browsers' languages

}


export function defaultConfig(): Config {
    return {
        kb: KbTarget.Dvorak,
        mapping: new NoMap(),
        check_mode: CheckMode.WordRepeat,
        backspace: BackspaceMode.Accept,
        tts: undefined,
        wordBatchSize: 4,
        minQueue: 2,
        stop: 'F4',
        pause: 'F4',
        lang: mapLocale(navigator.language),
    };
}


export function saveConfig(config: Config) {

}

export function loadConfig() {

}
