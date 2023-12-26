import { Audio } from "./audio";
import { defaultTtsLangs } from "./locales";
import { defaultMap, Remap } from "./remap";
import { Language } from "./language";
import { UserStats, type UserStatsObject } from "./stats";
import type { LessonTypingConfig } from '$lib/lessons/lessons'

export const storagePrefix = 'vkTutor_'
export const configKey = storagePrefix + 'config';

export const enum CheckMode {
    Char = 0,
    WordRepeat = 1, // redo current word if wrong
}

// ignores or accepts backspace
export const enum BackspaceMode {
    Accept = 0,
    Ignore = 1,
}


type ConfigProps = {
    version: number;
    tts: Audio | undefined;
    stop: string;
    pause: string;
    logStats: boolean;
    audioDefaults: string[]; // array to match different browsers' tts languages
    remap: Remap;
    lang: Language;
    userStats: UserStats;
} & LessonTypingConfig;

type ConfigStorable = Omit<ConfigProps, "tts" | "lang" | "remap" | "audio" | "userStats"> & { tts: string, lang: string, remap: string, audio: string, userStats: UserStatsObject };

export interface Config extends ConfigProps { }

export class Config implements ConfigProps {
    constructor(c: ConfigProps) {

        for (const key in c) {
            // @ts-ignore
            this[key] = c[key];
        }
    }

    static async default(fetchFn: typeof fetch = fetch): Promise<Config> {
        const audioDefaults = defaultTtsLangs(navigator.language);
        const userStats = new UserStats();

        const lang = await Language.default(fetchFn);
        const remap = await Remap.load(defaultMap, fetchFn);
        const tts = undefined;

        return new Config({
            version: 1,
            checkMode: CheckMode.WordRepeat,
            backspace: true,
            wordBatchSize: 10,
            minQueue: 8,
            stop: 'F7',
            pause: 'F4',
            logStats: true,
            tts,
            audioDefaults,
            remap,
            lang,
            userStats,
            spaceOptional: false,
            random: true,
            until: 100
        });
    }

    toJSON(): Object {
        const obj: any = {};
        for (const key in this) {
            if (!Object.hasOwn(this, key)) continue;

            if (key === 'tts') obj[key] = Audio.serialize(this.tts);
            else if (key === 'remap') obj[key] = this.remap.getId();
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

        const lang = await Language.load(o.lang, fetchFn);
        const remap = await Remap.load(o.remap, fetchFn);
        const tts = Audio.deserialize(o.tts);
        const userStats = UserStats.deserialize(o.userStats);

        const c: ConfigProps = { ...o, lang, remap, tts, userStats };
        return new Config(c);
    }

    static async loadUserConfig(fetchFn: typeof fetch = fetch): Promise<Config> {
        const s = localStorage.getItem(configKey);
        if (s !== null)
            return Config.deserialize(s, fetchFn);
        return Config.default(fetchFn);
    }

    saveUserConfig() {
        localStorage.setItem(configKey, this.serialize())
    }

    lessonConfig(): LessonTypingConfig {
        return {
            random: this.random,
            until: this.until,
            wordBatchSize: this.wordBatchSize,
            minQueue: this.minQueue,
            checkMode: this.checkMode,
            backspace: this.backspace,
            spaceOptional: this.spaceOptional,
        }
    }

    lessonConfigOverrides(opts: Partial<LessonTypingConfig>): LessonTypingConfig {
        return {
            random: opts.random ?? this.random,
            until: opts.until === undefined ? this.until : opts.until,
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace,
            spaceOptional: opts.spaceOptional ?? this.spaceOptional,
        }
    }

    mergeLessonConfig(opts: Partial<LessonTypingConfig>): Config {
        const props = {
            version: this.version,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace,
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            stop: this.stop,
            pause: this.pause,
            logStats: this.logStats,
            tts: this.tts,
            audioDefaults: this.audioDefaults,
            remap: this.remap,
            lang: this.lang,
            userStats: this.userStats,
            spaceOptional: opts.spaceOptional ?? this.spaceOptional,
            random: opts.random ?? this.random,
            until: opts.until === undefined ? this.until : opts.until,
        };
        return new Config(props)
    }
}

