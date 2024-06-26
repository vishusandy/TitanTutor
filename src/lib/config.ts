import { Audio } from "./audio";
import { defaultTtsLangs } from "./data/locales";
import { Remap } from "./data/remap";
import { defaultMap } from '$lib/conf/kbmaps';
import { Language } from "./data/language";
import { UserStats } from "./stats";
import type { LessonTypingConfig } from '$lib/types/lessons'
import { addUpdate, config_store, get } from "$lib/db";
import { defaultLessonOptsAvail, type LessonOptsAvailable } from "./types/forms";
import { configDefaultValues } from "$lib/conf/config";
import { defaultUserId } from "$lib/conf/config";
import type { ConfigProps, ConfigStorable } from '$lib/types/config';



// This is needed to specify that the Config class has all of the properties defined in ConfigProps.
export interface Config extends ConfigProps { }

/**
 * Stores user settings and handles serialization/deserialization.
 */
export class Config implements ConfigProps {

    /**
     * Creates a new instance of the {@link Config} class.
     * @param {ConfigProps} c - the config properties for the new class
     */
    constructor(c: ConfigProps) {
        for (const key in c) {
            // @ts-ignore
            this[key] = c[key];
        }
    }


    /** 
     * Creates an object that can easily be serialized in order to store the properties of an instance of the {@link Config} class.
     * {@link JSON.stringify()} will implicitly call this method when serializing a {@link Config} object.
    */
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

    /**
     * Serializes a {@link Config} instance by calling {@link JSON.stringify()}, which will implicitly call the {@link toJSON()} method first.
     * @returns {string} a string representing a serialized {@link Config} object
     */
    serialize(): string {
        // implicitly calls the toJSON() method
        return JSON.stringify(this);
    }


    /**
     * Stores a user's settings in IndexedDB.
     * @param {IDBDatabase} db - the IndexedDB connection to use
     */
    saveUserConfig(db: IDBDatabase): Promise<any | undefined> {
        const data = this.toJSON();
        return addUpdate(db, config_store, data);
    }

    /**
     * Combine a partial {@link LessonTypingConfig} with the user's settings to create a {@link LessonTypingConfig} object that inherits user settings when a field in `opts` is left undefined.
     * @param opts - an object which may contain any or all of the fields of a {@link LessonTypingConfig} object (or may also be an empty object)
     * @returns {LessonTypingConfig} returns a new {@link LessonTypingConfig} object
     */
    lessonOptions(opts: Partial<LessonTypingConfig>): LessonTypingConfig {
        return {
            random: opts.random ?? this.random,
            until: opts.until === undefined ? this.until : opts.until,
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace,
            spaceOptional: opts.spaceOptional ?? this.spaceOptional,
            adaptive: opts.adaptive ?? this.adaptive,
            caseSensitive: opts.caseSensitive ?? this.caseSensitive,
        }
    }

    /**
     * Combine a partial {@link LessonTypingConfig} with the user's settings to create a {@link Config} object that inherits user settings when a field in `opts` is left undefined.
     * @param opts - an object which may contain any or all of the fields of a {@link LessonTypingConfig} object (or may also be an empty object)
     * @returns {Config} returns a new {@link Config} instance
     */
    mergeLessonOptions(opts: Partial<LessonTypingConfig>): Config {
        return new Config({
            user: this.user,
            lastLesson: this.lastLesson,
            checkMode: opts.checkMode ?? this.checkMode,
            backspace: opts.backspace ?? this.backspace,
            wordBatchSize: opts.wordBatchSize ?? this.wordBatchSize,
            minQueue: opts.minQueue ?? this.minQueue,
            shortcuts: this.shortcuts,
            logStats: this.logStats,
            caseSensitive: opts.caseSensitive ?? this.caseSensitive,
            tts: this.tts,
            audioDefaults: this.audioDefaults,
            remap: this.remap,
            lang: this.lang,
            userStats: this.userStats,
            nextCustomId: this.nextCustomId,
            spaceOptional: opts.spaceOptional ?? this.spaceOptional,
            random: opts.random ?? this.random,
            until: opts.until === undefined ? this.until : opts.until,
            adaptive: opts.adaptive ?? this.adaptive
        });
    }

    /**
     * Creates a new {@link Config} instance with ovridden values from a {@link LessonOptsAvailable} object.
     * @param {LessonOptsAvailable} avail - specifies which values can be copied and which must be overidden
     * @returns {Config} returns a new {@link Config} object
     */
    mergeAvailable(avail: LessonOptsAvailable): Config {
        let k: keyof typeof defaultLessonOptsAvail;
        let out: Config = { ...this };
        for (k in defaultLessonOptsAvail) {
            if (avail[k] !== 'disabled' && avail[k] !== 'enabled') {
                // @ts-ignore
                out[k] = avail[k];
            }
        }
        return out;
    }
}


/**
 * Create a new {@link Config} instance with default values for the given user.
 * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
 * @returns {Promise} returns a promise that will yield an instance of {@link Config}
 */
export async function defaultConfig(fetchFn: typeof fetch = fetch): Promise<Config> {
    const audioDefaults = defaultTtsLangs(navigator.language);
    const userStats = new UserStats();

    const lang = await Language.default(fetchFn);
    const remap = await Remap.load(defaultMap, fetchFn);
    const tts = undefined;

    return new Config({
        ...configDefaultValues,
        tts,
        audioDefaults,
        remap,
        lang,
        userStats
    });
}



/**
 * Deserializes a {@link Config} instance.
 * @param {ConfigStorable} s - the storable object
 * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
 * @returns {Promise} returns a promise that will yield an instance of {@link Config}
 */
export async function deserialize(s: ConfigStorable, fetchFn: typeof fetch = fetch): Promise<Config> {
    const o: ConfigStorable = s;

    const lang = await Language.load(o.lang, fetchFn);
    const remap = await Remap.load(o.remap, fetchFn);
    const tts = Audio.deserialize(o.tts);
    const userStats = UserStats.deserialize(o.userStats);

    const c: ConfigProps = { ...configDefaultValues, ...o, lang, remap, tts, userStats };
    return new Config(c);
}


/**
 * Loads a user's stored settings or returns new settings with default values.
 * @param {IDBDatabase} db - the IndexedDB connection to use
 * @returns {Promise} returns a promise that will yield an instance of {@link Config}
 */
export async function loadUserConfig(db: IDBDatabase): Promise<Config> {
    // return await getCallback<ConfigStorable, Promise<Config>, Promise<Config>>(db, config_store, defaultUserId, (res) => Config.deserialize(res), () => Config.default(), () => Config.default());
    const data = await get<ConfigStorable>(db, config_store, defaultUserId);
    if (data === undefined) {
        return defaultConfig();
    }
    return deserialize(data);
}

