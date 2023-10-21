import { StockWordListLesson, type StorableStockList } from './base/wordlist';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { getDefaultLessonFromLocale, stockLessons } from '$lib/locales';
import { storagePrefix, Config, CheckMode } from '$lib/config';
import type { LessonFormState } from '$lib/forms';
import type { Language } from '$lib/language';
import { UserWordList, type StorableUserWordlist } from './base/user_wordlist';


const userLessonPrefix = `${storagePrefix}user_lesson_`;
const lastLessonPrefix = `${storagePrefix}last_lesson_`;
const lessonOptionsPrefix = `${storagePrefix}lesson_options_`;

export type LessonTypingConfig = {
    random: boolean,
    until: number | null,
    wordBatchSize: number,
    minQueue: number,
    checkMode: CheckMode,
    backspace: boolean
};

export interface StorableLesson {
    type: 'wordlist' | 'random' | 'until' | 'userwordlist' | 'chars';
}

export interface BaseLesson extends Lesson {
    id: string;
    getName(lang: Language): string;
}

export interface WordListBase extends Lesson, BaseLesson {
    words: string[];
    pos: number;
    id: string;
}

export abstract class Lesson implements Iterator<string>, Iterable<string> {
    abstract batch(n: number): string[];
    abstract toJSON(): string;
    abstract storable(): StorableLesson;
    abstract next(): IteratorResult<string>;
    abstract [Symbol.iterator](): typeof this;
    abstract setFormState(state: LessonFormState): void;
    abstract getChild(): Lesson | undefined;
    abstract getType(): string;
    abstract baseLesson(): BaseLesson;
}

async function deserializeStorableConfig(s: StorableLesson, opts: LessonTypingConfig, fetchFn: typeof fetch = fetch) {
    let storable = s;
    if (opts.random) {
        storable = RandomList.newStorable(s);
    }
    if (opts.until !== null) {
        storable = UntilN.newStorable(s, opts.until);
    }
    return deserializeStorable(storable, fetchFn);
}

export async function deserializeStorable(s: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    if (!s.hasOwnProperty('type'))
        throw new Error("Attempted to load invalid lesson");

    switch (s.type) {
        case 'wordlist':
            return StockWordListLesson.fromStorable(s as StorableStockList, fetchFn);
        case 'userwordlist':
            return UserWordList.fromStorable(s as StorableUserWordlist);
        case 'random':
            return RandomList.fromStorable(s as StorableRandom, fetchFn);
        case 'until':
            return UntilN.fromStorable(s as StorableUntil, fetchFn);
        // case 'weighted':
        //     return WeightedShuffle.fromStorable(o as StorableWeightedShuffle, fetchFn);
        default:
            throw new Error(`Attempted to load lesson with invalid type`)
    }
}


export function getOverrides(id: string): Partial<LessonTypingConfig> {
    const opts = localStorage.getItem(`${lessonOptionsPrefix}${id}`);
    return (opts !== null) ? JSON.parse(opts) : {};
}

export function saveOverrides(id: string, overrides: Partial<LessonTypingConfig>) {
    localStorage.setItem(`${lessonOptionsPrefix}${id}`, JSON.stringify(overrides));
}

export async function getLastLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lastLesson = localStorage.getItem(lastLessonPrefix);
    if (lastLesson === null)
        return getLocaleDefaultLesson(config, fetchFn);
    return loadLesson(lastLesson, fetchFn);
}

export async function loadLesson(id: string, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    if (id.startsWith('user_')) {
        const storable = localStorage.getItem(userLessonPrefix + id);
        if (storable === null) throw new Error(`Could not find user lesson '${id}'`);
        return deserializeStorable(JSON.parse(storable), fetchFn);
    }

    const storable = stockLessons.get(id);
    if (storable === undefined)
        throw new Error(`Could not find lesson '${id}'`);
    return deserializeStorable(storable, fetchFn);
}

export function saveUserLesson(lesson: Lesson, saveAsLastLesson: boolean = true) {
    const storable = lesson.storable();
    localStorage.setItem(userLessonPrefix + lesson.baseLesson().id, JSON.stringify(storable));
    if (saveAsLastLesson) {
        saveLast(lesson);
    }
}

export function saveLast(lesson: Lesson) {
    localStorage.setItem(lastLessonPrefix, lesson.baseLesson().id);
}

async function getLocaleDefaultLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lesson = getDefaultLessonFromLocale(config.lang.lang);
    return loadLesson(lesson, fetchFn);
}
