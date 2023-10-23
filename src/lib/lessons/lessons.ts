import { StockWordList, type StorableStockList } from './base/wordlist';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { getDefaultLessonFromLocale, stockLessons } from '$lib/locales';
import { storagePrefix, Config, CheckMode } from '$lib/config';
import type { LessonFormState } from '$lib/forms';
import type { Language } from '$lib/language';
import { UserWordList, type StorableUserWordlist } from './base/user_wordlist';
import type { BaseWordList } from './base/wordlist_base';


const userLessonPrefix = `${storagePrefix}user_lesson_`;
const lastLessonPrefix = `${storagePrefix}last_lesson_`;
const lessonOptionsPrefix = `${storagePrefix}lesson_options_`;

export type LessonTypingConfig = {
    random: boolean,
    until: number | null,
    wordBatchSize: number,
    minQueue: number,
    checkMode: CheckMode,
    backspace: boolean,
    spaceOptional: boolean
};


export function canRandomize(type: string): boolean {
    return type === 'wordlist' || type === 'userwordlist';
}


export interface StorableBaseLesson extends StorableLesson {
    id: string;
}

export interface BaseLesson extends Lesson {
    id: string;
    getName(lang: Language): string;
}

export interface StorableLesson {
    type: 'wordlist' | 'random' | 'until' | 'userwordlist' | 'chars';
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


export function addWrappers(lesson: Lesson, opts: LessonTypingConfig): Lesson {
    let result: Lesson;

    if (opts.random === true && canRandomize(lesson.baseLesson().getType())) {
        result = new RandomList(lesson as BaseWordList);
    } else {
        result = lesson;
    }

    const max = opts.until;
    if (typeof max === 'number') {
        result = new UntilN(result, max);
    }

    return result;
}

export async function deserializeStorableFromOverrides(s: StorableBaseLesson, opts: LessonTypingConfig, fetchFn: typeof fetch = fetch) {
    let storable: StorableLesson = s;
    if (opts.random && canRandomize(s.type)) {
        storable = RandomList.newStorable(storable);
    }
    if (opts.until !== null) {
        storable = UntilN.newStorable(storable, opts.until);
    }

    return deserializeStorable(storable, fetchFn);
}

export async function deserializeStorableFromConfig(id: string, s: StorableBaseLesson, config: Config, fetchFn: typeof fetch = fetch) {
    const opts = config.lessonConfigOverrides(getOverrides(id));
    return deserializeStorableFromOverrides(s, opts, fetchFn);
}

export async function deserializeStorable(s: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    switch (s.type) {
        case 'wordlist':
            return StockWordList.fromStorable(s as StorableStockList, fetchFn);
        case 'userwordlist':
            return UserWordList.fromStorable(s as StorableUserWordlist, fetchFn);
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

    return loadLesson(lastLesson, config, fetchFn);
}

export async function loadLesson(id: string, config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    if (id.startsWith('user_')) {
        const storable = localStorage.getItem(userLessonPrefix + id);
        if (storable === null) throw new Error(`Could not find user lesson '${id}'`);
        return deserializeStorableFromConfig(id, JSON.parse(storable), config, fetchFn);
    }

    const storable = stockLessons.get(id);
    if (storable === undefined)
        throw new Error(`Could not find lesson '${id}'`);
    return deserializeStorableFromConfig(id, storable, config, fetchFn);
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
    return loadLesson(lesson, config, fetchFn);
}
