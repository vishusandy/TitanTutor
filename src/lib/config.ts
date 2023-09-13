import type Word from "./word.svelte";
import { type KeyboardMap, noMap } from "./mappings";

export const enum KbTarget {
    Qwerty = 0,
    Dvorak = 1,
}

export const enum KbMapping {
    None = 0,
    QwertyToDvorak = 1,
}

export const enum CheckMode {
    Char = 0,
    WholeWord = 1, // move to next word after hitting space
    WholeWordRepeat = 2, // redo current word if wrong
}


// ignores backspace/delete
export const enum BackspaceMode {
    Accept = 0,
    Ignore = 1,
}

export type Audio = {
    rate: number;
    pitch: number;
    volume: number;
    voice: SpeechSynthesisVoice;
}

export const enum DurationType {
    NumWords = 0,
    Time = 1,
    UntilError = 2,
}

export type Duration = {
    length: number;
    type: DurationType;
}

export const enum WordGenMode {
    Pregen = 0,
    OnDemand = 1,
}


export type Config = {
    kb: KbTarget;
    mapping: KeyboardMap;
    check_mode: CheckMode;
    backspace: BackspaceMode;
    wordgen: WordGenMode;
    tts?: Audio;
    duration: Duration;
    showWords: number;
}


export function defaultConfig(): Config {
    return {
        kb: KbTarget.Dvorak,
        mapping: noMap,
        check_mode: CheckMode.Char,
        backspace: BackspaceMode.Accept,
        wordgen: WordGenMode.Pregen,
        tts: undefined,
        duration: { length: 100, type: DurationType.NumWords },
        showWords: 10
    };
}
