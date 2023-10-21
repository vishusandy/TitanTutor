import { Audio } from "./audio";
import { getDefaultTtsLangsFromLocale, getInterfaceLangFromLocale } from "./locales";
import { defaultMap, loadKbMap, type Remap } from "./remap";
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
    checkMode: CheckMode;
    backspace: boolean;
    tts: Audio | undefined;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    logStats: boolean;
    audioDefaults: string[]; // array to match different browsers' tts languages
    remap: Remap;
    lang: Language;
    userStats: UserStats;
    spaceOptional: boolean;
    randomizeLesson: boolean;
    lessonSize: number | null;
}

type ConfigStorable = Omit<ConfigProps, "tts" | "lang" | "remap" | "audio" | "userStats"> & { tts: string, lang: string, remap: string, audio: string, userStats: UserStatsObject };

export class Config implements ConfigProps {
    version: number;
    checkMode: CheckMode;
    backspace: boolean;
    tts: Audio | undefined;
    wordBatchSize: number;
    minQueue: number;
    stop: string;
    pause: string;
    logStats: boolean;
    audioDefaults: string[]; // array to match different browsers' tts languages
    remap: Remap;
    lang: Language;
    userStats: UserStats;
    spaceOptional: boolean;
    randomizeLesson: boolean;
    lessonSize: number | null;


    constructor(c: ConfigProps) {
        this.version = c.version;
        this.checkMode = c.checkMode;
        this.backspace = c.backspace;
        this.tts = c.tts;
        this.wordBatchSize = c.wordBatchSize;
        this.minQueue = c.minQueue;
        this.stop = c.stop;
        this.pause = c.pause;
        this.logStats = c.logStats;
        this.audioDefaults = c.audioDefaults;
        this.remap = c.remap;
        this.lang = c.lang;
        this.userStats = c.userStats;
        this.spaceOptional = c.spaceOptional;
        this.randomizeLesson = c.randomizeLesson;
        this.lessonSize = c.lessonSize;
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
            randomizeLesson: true,
            lessonSize: 100
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
            random: this.randomizeLesson,
            until: this.lessonSize,
            wordBatchSize: this.wordBatchSize,
            minQueue: this.minQueue,
            checkMode: this.checkMode,
            backspace: this.backspace
        }
    }

    lessonConfigOverrides(opts: Partial<LessonTypingConfig>): LessonTypingConfig {
        return {
            random: opts.random ?? this.randomizeLesson,
            until: opts.until === undefined ? this.lessonSize : opts.until,
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace
        }
    }

    // async deserializeLessonBase(s: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    //     let lesson: Lesson;
    //     if(this.randomizeLesson) {}
    // }

    // setLessonFormState(state: LessonFormState) {
    //     state.random = this.randomizeLesson;
    //     if (this.lessonSize !== undefined) {
    //         state.until = this.lessonSize;
    //     }
    // }
}

