// import { qwertyToDvorak } from "./mappings/qwerty_to_dvorak";
import type { Mapping } from "./mappings";
import { NoMap } from "./mappings/no_map";
import { Audio } from "./audio";
import { deserializeMapping, mapLocale } from "./util";

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

export class Config {
    version: number;
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

    constructor(
        version: number,
        kb: KbTarget,
        mapping: Mapping,
        check_mode: CheckMode,
        backspace: BackspaceMode,
        tts: Audio | undefined,
        wordBatchSize: number,
        minQueue: number,
        stop: string,
        pause: string,
        lang: string[]
    ) {
        this.version = version;
        this.kb = kb;
        this.mapping = mapping;
        this.check_mode = check_mode;
        this.backspace = backspace;
        this.tts = tts;
        this.wordBatchSize = wordBatchSize;
        this.minQueue = minQueue;
        this.stop = stop;
        this.pause = pause;
        this.lang = lang;
    }

    static default() {
        return new Config(
            1,
            KbTarget.Dvorak,
            new NoMap(),
            CheckMode.WordRepeat,
            BackspaceMode.Accept,
            undefined,
            4,
            2,
            'F4',
            'F4',
            mapLocale(navigator.language)
        );
    }

    storable(): StorableConfig {
        return new StorableConfig(this);
    }

    static load(s: string): Config {
        return StorableConfig.deserialize(s);
    }
}


class StorableConfig {
    version: number;
    kb: number;
    mapping: string;
    check_mode: number;
    backspace: number;
    tts: string;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    lang: string[];

    constructor(config: Config) {
        this.version = config.version;
        this.kb = config.kb;
        this.mapping = config.mapping.serialize();
        this.check_mode = config.check_mode;
        this.backspace = config.backspace;
        this.tts = Audio.serialize(config.tts);
        this.wordBatchSize = config.wordBatchSize;
        this.minQueue = config.minQueue;
        this.stop = config.stop;
        this.pause = config.pause;
        this.lang = config.lang;
    }

    static deserialize(s: string): Config {
        const o: StorableConfig = JSON.parse(s);

        return new Config(
            o.version,
            o.kb,
            deserializeMapping(o.mapping),
            o.check_mode,
            o.backspace,
            Audio.deserialize(o.tts),
            o.wordBatchSize,
            o.minQueue,
            o.stop,
            o.pause,
            o.lang
        );
    }
}
