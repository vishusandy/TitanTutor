import { Audio } from "../audio";
import { defaultTtsLangs } from "../data/locales";
import { Remap } from "../data/remap";
import { defaultMap } from '$lib/conf/kbmaps';
import { Language } from "../data/language";
import { UserStats, type UserStatsObject } from "../stats";
import type { LessonTypingConfig } from '$lib/lessons/lesson'
import { config_store, get } from "$lib/db";
import { defaultLessonOptsAvail, type LessonOptsAvailable } from "./forms";

export const storagePrefix = 'vkTutor_'
export const defaultUserId = 'default';

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
    user: string,
    lastLesson: string | null;
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
            tts,
            audioDefaults,
            remap,
            lang,
            userStats,
            spaceOptional: false,
            random: true,
            until: 100,
            adaptive: false
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
        // implicitly calls the toJSON() method
        return JSON.stringify(this);
    }

    static async deserialize(s: ConfigStorable, fetchFn: typeof fetch = fetch): Promise<Config> {
        const o: ConfigStorable = s;

        const lang = await Language.load(o.lang, fetchFn);
        const remap = await Remap.load(o.remap, fetchFn);
        const tts = Audio.deserialize(o.tts);
        const userStats = UserStats.deserialize(o.userStats);

        const c: ConfigProps = { ...o, lang, remap, tts, userStats };
        return new Config(c);
    }

    static async loadUserConfig(db: IDBDatabase): Promise<Config> {
        return await get<ConfigStorable, Promise<Config>, Promise<Config>>(db, config_store, defaultUserId, (res) => Config.deserialize(res), () => Config.default(), () => Config.default());
    }

    saveUserConfig(db: IDBDatabase) {
        const t = db.transaction([config_store], "readwrite");

        const data = this.toJSON();
        const c = t.objectStore(config_store);
        c.put(data);

        localStorage.setItem(defaultUserId, this.user);
    }

    lessonOptions(opts: Partial<LessonTypingConfig>): LessonTypingConfig {
        return {
            random: opts.random ?? this.random,
            until: opts.until === undefined ? this.until : opts.until,
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace,
            spaceOptional: opts.spaceOptional ?? this.spaceOptional,
            adaptive: opts.adaptive ?? this.adaptive
        }
    }

    mergeLessonOptions(opts: Partial<LessonTypingConfig>): Config {
        return new Config({
            user: this.user,
            lastLesson: this.lastLesson,
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
            adaptive: opts.adaptive ?? this.adaptive
        });
    }

    mergeAvailable(a: LessonOptsAvailable): Config {
        let k: keyof typeof defaultLessonOptsAvail;
        let out: Config = { ...this };
        for (k in defaultLessonOptsAvail) {
            if (a[k] !== 'disabled' && a[k] !== 'enabled') {
                // @ts-ignore
                out[k] = a[k];
            }
        }
        return out;
    }
}

