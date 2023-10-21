import { StockWordListLesson, type StorableStockList } from './base/wordlist';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { getDefaultLessonFromLocale, stockLessons } from '$lib/locales';
import { storagePrefix, type LessonTypingConfig, Config } from '$lib/config';
import type { LessonFormState } from '$lib/forms';
import type { Language } from '$lib/language';


export interface StorableLesson {
    type: string;
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

export async function deserializeStorable(o: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    if (!o.hasOwnProperty('type'))
        throw new Error("Attempted to load invalid lesson");

    switch (o.type) {
        case 'wordlist':
            return StockWordListLesson.fromStorable(o as StorableStockList, fetchFn);
        case 'random':
            return RandomList.fromStorable(o as StorableRandom, fetchFn);
        case 'until':
            return UntilN.fromStorable(o as StorableUntil, fetchFn);
        // case 'weighted':
        //     return WeightedShuffle.fromStorable(o as StorableWeightedShuffle, fetchFn);
        default:
            throw new Error(`Attempted to load lesson with invalid type`)
    }
}


export function getLocalStorageLessonOverrides(id: string): Partial<LessonTypingConfig> {
    const opts = localStorage.getItem(`${storagePrefix}lesson_options_${id}`);
    return (opts !== null) ? JSON.parse(opts) : {};
}

export function saveUserLessonOverrides(id: string, overrides: Partial<LessonTypingConfig>) {
    localStorage.setItem(`${storagePrefix}lesson_options_${id}`, JSON.stringify(overrides));
}

export async function loadLastLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lastLesson = localStorage.getItem(storagePrefix + 'last_lesson');

    if (lastLesson === null)
        return loadDefaultLesson(config, fetchFn);

    return loadLesson(lastLesson, fetchFn);
}

export async function loadLesson(id: string, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const local = localStorage.getItem(storagePrefix + 'user_lesson_' + id);
    const storable = local === null ? stockLessons.get(id) : JSON.parse(local) as StorableLesson;
    if (storable === undefined) {
        throw new Error(`Could not find lesson '${id}'`);
    }
    return deserializeStorable(storable, fetchFn);
}

export function saveUserLesson(lesson: Lesson, saveAsLastLesson: boolean = true) {
    const storable = lesson.storable();
    localStorage.setItem(storagePrefix + 'user_lesson_' + lesson.baseLesson().id, JSON.stringify(storable));
    if (saveAsLastLesson) {
        saveLast(lesson);
    }
}

export function saveLast(lesson: Lesson) {
    localStorage.setItem(storagePrefix + 'last_lesson', lesson.baseLesson().id);
}


async function loadDefaultLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lesson = getDefaultLessonFromLocale(config.lang.lang);
    return loadLesson(lesson, fetchFn);
}
