import { Audio } from "./audio";
import { getDefaultTtsLangsFromLocale, getInterfaceLangFromLocale } from "./locales";
import type { LessonOptions } from "./lessons/options";
import { defaultMap, loadKbMap, type Remap } from "./remap";
import { Language } from "./language";

export const storagePrefix = 'vkTutor_'

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

export type LessonConfig = {
    wordBatchSize: number,
    minQueue: number,
    checkMode: CheckMode,
    backspace: BackspaceMode
};

export const defaultLessonConfig = {
    wordBatchSize: 10,
    minQueue: 4,
    checkMode: CheckMode.WordRepeat,
    backspace: BackspaceMode.Accept,
};

export class Config {
    version: number;
    kb: KbTarget;
    checkMode: CheckMode;
    backspace: BackspaceMode;
    tts: Audio | undefined;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    audioDefaults: string[]; // array to match different browsers' languages
    remap: Remap;
    lang: Language;

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
        remap: Remap,
        lang: Language
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
        this.remap = remap;
        this.lang = lang;
    }

    static async default(fetchFn: typeof fetch = fetch): Promise<Config> {
        const locale = getInterfaceLangFromLocale(navigator.language);
        const lang = await Language.loadLang(locale, fetchFn)
        const remap = await loadKbMap(defaultMap, fetchFn);

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
            getDefaultTtsLangsFromLocale(navigator.language),
            remap,
            lang
        );
    }

    serialize(): string {
        return JSON.stringify(this)
    }

    toJSON(): Object {
        return {
            version: this.version,
            kb: this.kb,
            checkMode: this.checkMode,
            backspace: this.backspace,
            tts: Audio.serialize(this.tts),
            wordBatchSize: this.wordBatchSize,
            minQueue: this.minQueue,
            stop: this.stop,
            pause: this.pause,
            audioDefaults: this.audioDefaults,
            remap: this.remap.getName(),
            lang: this.lang.lang,
        };
    }

    static async deserialize(s: string, fetchFn: typeof fetch = fetch): Promise<Config> {
        const o = JSON.parse(s);
        const lang = await Language.loadLang(o.lang, fetchFn);
        const remap = await loadKbMap(o.remap, fetchFn);

        return new Config(
            o.version,
            o.kb,
            o.checkMode,
            o.backspace,
            Audio.deserialize(o.tts),
            o.wordBatchSize,
            o.minQueue,
            o.stop,
            o.pause,
            o.audioDefaults,
            remap,
            lang
        );
    }

    static async loadUserConfig(fetchFn: typeof fetch = fetch): Promise<Config> {
        let c = localStorage.getItem(storagePrefix + 'config');
        if (c !== null) {
            return Config.deserialize(c, fetchFn);
        }

        return Config.default(fetchFn);
    }

    saveUserConfig() {
        localStorage.setItem(storagePrefix + 'config', this.serialize())
    }

    getOverrides(opts: LessonOptions): LessonConfig {
        return {
            wordBatchSize: opts.config.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.config.minQueue ?? this.minQueue,
            checkMode: opts.config.checkMode ?? this.checkMode,
            backspace: opts.config.backspace ?? this.backspace
        }
    }
}

