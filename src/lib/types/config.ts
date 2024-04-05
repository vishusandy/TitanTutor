import type { Audio } from "../audio";
import type { Remap } from "../data/remap";
import type { Language } from "../data/language";
import { type UserStats, type UserStatsObject } from "../stats";
import type { LessonTypingConfig } from '$lib/types/lessons'

export const enum LogStats {
    Off = 0,
    Prompt = 1,
    Always = 2,
}

export type ShortuctConfig = {
    stop: string;
    pause: string;
};

/**
 * Specifies the fields available in the {@link Config} class.
 */
export type ConfigProps = {
    user: string,
    lastLesson: string | null,
    tts: Audio | undefined,
    shortcuts: ShortuctConfig,
    logStats: LogStats,
    caseSensitive: boolean,
    audioDefaults: string[], // array to match different browsers' tts languages
    remap: Remap,
    lang: Language,
    userStats: UserStats,
    nextCustomId: number,
} & LessonTypingConfig;

/**
 * Lists the fields of {@link Config} that are represented by classes or object types, and thus may require additional steps for serialization/deserialization.
 */
export type ComplexConfigProps = "tts" | "lang" | "remap" | "userStats";

/**
 * Only the basic {@link Config} options, which are options that are js primitve values or array (not a class or other object type).
 */
export type BasicConfigProps = Omit<ConfigProps, "audioDefaults" | ComplexConfigProps>;

/**
 * Defines the fields used to store a serialized {@link Config} object.
 */
export type ConfigStorable = Omit<ConfigProps, ComplexConfigProps> & { tts: string, lang: string, remap: string, userStats: UserStatsObject };
