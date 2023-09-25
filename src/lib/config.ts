// import { qwertyToDvorak } from "./mappings/qwerty_to_dvorak";
import { type Mapping, NoMap } from "./mappings";

export const enum KbTarget {
    Qwerty = 0,
    Dvorak = 1,
}

export const enum CheckMode {
    Char = 0,
    WordRepeat = 1, // redo current word if wrong
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

// class Audio {
//     rate: number; // 0.5 to 2.0
//     pitch: number; // 0.0 to 2.0
//     volume: number; // 0.0 to 1.0
//     voice: SpeechSynthesisVoice;

// }

export const enum DurationType {
    NumWords = 0,
    Time = 1,
    UntilError = 2,
}

export type Duration = {
    length: number;
    type: DurationType;
}


export type Config = {
    kb: KbTarget;
    mapping: Mapping;
    check_mode: CheckMode;
    backspace: BackspaceMode;
    tts?: Audio;
    duration: Duration;
    wordBatchSize: number;
    minQueue: number;
}


export function defaultConfig(): Config {
    return {
        kb: KbTarget.Dvorak,
        mapping: new NoMap(),
        check_mode: CheckMode.WordRepeat,
        backspace: BackspaceMode.Accept,
        tts: undefined,
        duration: { length: 100, type: DurationType.NumWords },
        wordBatchSize: 4,
        minQueue: 2,
    };
}
