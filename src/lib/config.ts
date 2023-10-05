import { Audio } from "./audio";
import { mapLocale } from "./util";
import type { LessonOptions } from "./lessons/options";

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

export type Overrides = {
    wordBatchSize: number,
    minQueue: number,
    checkMode: CheckMode,
    backspace: BackspaceMode
};

export class Config {
    version: number;
    kb: KbTarget;
    checkMode: CheckMode;
    backspace: BackspaceMode;
    tts?: Audio;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    audioDefaults: string[]; // array to match different browsers' languages

    constructor(
        version: number,
        kb: KbTarget,
        check_mode: CheckMode,
        backspace: BackspaceMode,
        tts: Audio | undefined,
        wordBatchSize: number,
        minQueue: number,
        stop: string,
        pause: string,
        audioDefaults: string[],
    ) {
        this.version = version;
        this.kb = kb;
        this.checkMode = check_mode;
        this.backspace = backspace;
        this.tts = tts;
        this.wordBatchSize = wordBatchSize;
        this.minQueue = minQueue;
        this.stop = stop;
        this.pause = pause;
        this.audioDefaults = audioDefaults;
    }

    static default() {
        return new Config(
            1,
            KbTarget.Dvorak,
            CheckMode.WordRepeat,
            BackspaceMode.Accept,
            undefined,
            10,
            8,
            'F4',
            'F4',
            mapLocale(navigator.language),
        );
    }

    storable(): StorableConfig {
        return new StorableConfig(this);
    }

    static deserialize(s: string): Config {
        return StorableConfig.deserialize(s);
    }

    static loadUserConfig(): Config {
        let c = localStorage.getItem('config');

        if (c !== null) {
            return Config.deserialize(c);
        }

        return Config.default();
    }

    getOverrides(opts: LessonOptions) {
        return {
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace
        }
    }
}


class StorableConfig {
    version: number;
    kb: number;
    check_mode: number;
    backspace: number;
    tts: string;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    audioDefaults: string[];

    constructor(config: Config) {
        this.version = config.version;
        this.kb = config.kb;
        this.check_mode = config.checkMode;
        this.backspace = config.backspace;
        this.tts = Audio.serialize(config.tts);
        this.wordBatchSize = config.wordBatchSize;
        this.minQueue = config.minQueue;
        this.stop = config.stop;
        this.pause = config.pause;
        this.audioDefaults = config.audioDefaults;
    }

    static deserialize(s: string): Config {
        const o: StorableConfig = JSON.parse(s);

        return new Config(
            o.version,
            o.kb,
            o.check_mode,
            o.backspace,
            Audio.deserialize(o.tts),
            o.wordBatchSize,
            o.minQueue,
            o.stop,
            o.pause,
            o.audioDefaults
        );
    }
}
