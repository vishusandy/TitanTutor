import { StockWordListLesson, type StorableStockList } from './base/stock';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { getDefaultLessonFromLocale, stockLessonPaths } from '$lib/locales';
import { storagePrefix, type LessonTypingConfig, Config } from '$lib/config';
import type { LessonFormState } from '$lib/forms';


export interface StorableLesson {
    type: string;
}

export interface WordListBase extends Lesson {
    words: string[];
    pos: number;
    lessonName: string;
}

export abstract class Lesson implements Iterator<string>, Iterable<string> {
    abstract batch(n: number): string[];
    abstract toJSON(): string;
    abstract storable(): StorableLesson;
    abstract next(): IteratorResult<string>;
    abstract [Symbol.iterator](): typeof this;
    abstract getLessonName(): string;
    abstract setFormState(state: LessonFormState): void;
    abstract getChild(): Lesson | undefined;
}

export async function retrieveFromStorable(o: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    if (!o.hasOwnProperty('type'))
        throw new Error("Attempted to load invalid lesson");

    switch (o.type) {
        case 'stock':
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

export function getUserLessonConfig(lessonName: string): Partial<LessonTypingConfig> {
    const opts = localStorage.getItem(`${storagePrefix}lesson_options_${lessonName}`);
    const o: Partial<LessonTypingConfig> = (opts !== null) ? JSON.parse(opts) : {};
    return o;
}

export async function loadUserLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lastLesson = localStorage.getItem(storagePrefix + 'lesson');
    if (lastLesson === null) {
        return loadDefaultLesson(config, fetchFn);
    }

    if (lastLesson.startsWith('user_')) {
        // todo
        throw new Error("Custom lessons are not implemented yet");
    }

    const storable = JSON.parse(lastLesson);
    return retrieveFromStorable(storable, fetchFn);
}



async function loadDefaultLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lesson = getDefaultLessonFromLocale(config.lang.lang);
    const path = stockLessonPaths.get(lesson);
    if (path === undefined) {
        throw new Error(`Could not find lesson '${lesson}'`);
    }
    return loadWordListLesson(lesson, path, config, fetchFn);
}

async function loadWordListLesson(lessonName: string, path: string, config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const storable: StorableStockList = StockWordListLesson.newStorable(lessonName, path);
    return StockWordListLesson.fromStorable(storable, fetchFn).then((s) => {
        return s;
    });
}

