import { Audio } from "./audio";
import { getDefaultTtsLangsFromLocale, getInterfaceLangFromLocale } from "./locales";
import { defaultMap, loadKbMap, type Remap } from "./remap";
import { Language } from "./language";
import { UserStats } from "./stats";

export const storagePrefix = 'vkTutor_'

export const enum CheckMode {
    Char = 0,
    WordRepeat = 1, // redo current word if wrong
}

// ignores or accepts backspace
export const enum BackspaceMode {
    Accept = 0,
    Ignore = 1,
}

export type LessonTypingConfig = {
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

type ConfigProps = {
    version: number;
    checkMode: CheckMode;
    backspace: BackspaceMode;
    tts: Audio | undefined;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    audioDefaults: string[]; // array to match different browsers' tts languages
    remap: Remap;
    lang: Language;
    userStats: UserStats;
}

type ConfigStorable = Omit<ConfigProps, "tts" | "lang" | "remap" | "audio"> & { tts: string, lang: string, remap: string, audio: string };

export class Config implements ConfigProps {
    version: number;
    checkMode: CheckMode;
    backspace: BackspaceMode;
    tts: Audio | undefined;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    audioDefaults: string[]; // array to match different browsers' tts languages
    remap: Remap;
    lang: Language;
    userStats: UserStats;

    constructor(c: ConfigProps) {
        this.version = c.version;
        this.checkMode = c.checkMode;
        this.backspace = c.backspace;
        this.tts = c.tts;
        this.wordBatchSize = c.wordBatchSize;
        this.minQueue = c.minQueue;
        this.stop = c.stop;
        this.pause = c.pause;
        this.audioDefaults = c.audioDefaults;
        this.remap = c.remap;
        this.lang = c.lang;
        this.userStats = c.userStats;
    }

    static async default(fetchFn: typeof fetch = fetch): Promise<Config> {
        const interfacePath = getInterfaceLangFromLocale(navigator.language);
        const audioDefaults = getDefaultTtsLangsFromLocale(navigator.language);
        const userStats = new UserStats();

        const lang = await Language.loadLang(interfacePath, fetchFn)
        const remap = await loadKbMap(defaultMap, fetchFn);
        const tts = undefined;

        return new Config({
            version: 1,
            checkMode: CheckMode.WordRepeat,
            backspace: BackspaceMode.Accept,
            wordBatchSize: 10,
            minQueue: 8,
            stop: 'F7',
            pause: 'F4',
            tts,
            audioDefaults,
            remap,
            lang,
            userStats
        });
    }

    toJSON(): Object {
        const obj: any = {};
        for (const key in this) {
            if (!Object.hasOwn(this, key)) continue;

            if (key === 'tts') obj[key] = Audio.serialize(this.tts);
            else if (key === 'remap') obj[key] = this.remap.getName();
            else if (key === 'lang') obj[key] = this.lang.lang;
            else obj[key] = this[key];
        }

        return obj;
    }

    serialize(): string {
        return JSON.stringify(this);
    }

    static async deserialize(s: string, fetchFn: typeof fetch = fetch): Promise<Config> {
        const o: ConfigStorable = JSON.parse(s);

        const lang = await Language.loadLang(o.lang, fetchFn);
        const remap = await loadKbMap(o.remap, fetchFn);
        const tts = Audio.deserialize(o.tts);

        const c: ConfigProps = { ...o, lang: lang, remap, tts };

        return new Config(c);
    }

    static async loadUserConfig(fetchFn: typeof fetch = fetch): Promise<Config> {
        const s = localStorage.getItem(storagePrefix + 'config');

        if (s !== null)
            return Config.deserialize(s, fetchFn);

        return Config.default(fetchFn);
    }

    saveUserConfig() {
        localStorage.setItem(storagePrefix + 'config', this.serialize())
    }

    lessonConfigOverrides(opts: Partial<LessonTypingConfig>): LessonTypingConfig {
        return {
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace
        }
    }
}

