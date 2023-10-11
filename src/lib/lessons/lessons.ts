import { StockWords, type StorableStock } from './base/stock';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { getDefaultLessonFromLocale, stockLessonPaths } from '$lib/locales';
import { storagePrefix, type LessonTypingConfig, Config } from '$lib/config';
import { WeightedList, type StorableWeighted } from './wrappers/weighted';


export interface StorableLesson {
    type: string;
}

export interface BaseLesson extends Lesson {
    words: string[];
    pos: number;
    lessonName: string;
    baseType(): string;
}

export abstract class Lesson implements Iterator<string>, Iterable<string> {
    abstract batch(n: number): string[];
    abstract toJSON(): string;
    abstract storable(): StorableLesson;
    abstract next(): IteratorResult<string>;
    abstract [Symbol.iterator](): typeof this;
    abstract getLessonName(): string;
}

export async function retrieveFromStorable(o: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    if (!o.hasOwnProperty('type')) {
        throw new Error("Attempted to load invalid lesson");
    }

    switch (o.type) {
        case 'stock':
            return StockWords.fromStorable(o as StorableStock, fetchFn);
        case 'random':
            return RandomList.fromStorable(o as StorableRandom, fetchFn);
        case 'until':
            return UntilN.fromStorable(o as StorableUntil, fetchFn);
        case 'weighted':
            return WeightedList.fromStorable(o as StorableWeighted, fetchFn);
        default:
            throw new Error(`Attempted to load lesson with invalid type`)
    }
}

export function getLessonConfig(lessonName: string, config: Config): LessonTypingConfig {
    const opts = localStorage.getItem(`${storagePrefix}lesson_options_${lessonName}`);
    const o: Partial<LessonTypingConfig> = (opts !== null) ? JSON.parse(opts) : {};
    return config.lessonConfigOverrides(o);
}

export async function loadUserLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lastLesson = localStorage.getItem(storagePrefix + 'lesson');

    if (lastLesson === null) {
        return loadDefaultLesson(config, fetchFn);
    }

    if (lastLesson.startsWith('user_')) {
        throw new Error("User lessons are not implemented yet");
    }

    const path = stockLessonPaths.get(lastLesson);
    if (path === undefined) {
        console.warn(`Could not find lesson '${lastLesson}'`);
        return loadDefaultLesson(config, fetchFn);
    }

    return loadStockLesson(lastLesson, path, config, fetchFn);
}


async function loadStockLesson(lessonName: string, path: string, config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const storable: StorableStock = StockWords.newStorable(lessonName, path);
    return StockWords.fromStorable(storable, fetchFn).then((s) => {
        return s;
    });
}

async function loadDefaultLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lesson = getDefaultLessonFromLocale(config.lang.lang);
    const path = stockLessonPaths.get(lesson);
    if (path === undefined) {
        throw new Error(`Could not find lesson '${lesson}'`);
    }
    return loadStockLesson(lesson, path, config, fetchFn);
}
