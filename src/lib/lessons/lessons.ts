import { StockWordListLesson, type StorableStockList } from './base/wordlist';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { getDefaultLessonFromLocale, stockLessons } from '$lib/locales';
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
    abstract baseType(): string;
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

function storableFromFormState(lessonName: string, form: LessonFormState) {

}

export function getUserLessonOverrides(lessonName: string): Partial<LessonTypingConfig> {
    const opts = localStorage.getItem(`${storagePrefix}lesson_options_${lessonName}`);
    return (opts !== null) ? JSON.parse(opts) : {};
}

export async function loadUserLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lastLesson = localStorage.getItem(storagePrefix + 'last_lesson');
    if (lastLesson === null) {
        return loadDefaultLesson(config, fetchFn);
    }

    if (lastLesson.startsWith('user_')) {
        // todo
        throw new Error("Custom lessons are not implemented yet");
    }

    return loadLesson(lastLesson, fetchFn);
}

export async function loadLesson(lessonName: string, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const local = localStorage.getItem(lessonName);
    const storable = local === null ? stockLessons.get(lessonName) : JSON.parse(local) as StorableLesson;
    if (storable === undefined) {
        throw new Error(`Could not find lesson '${lessonName}'`);
    }
    return deserializeStorable(storable, fetchFn);
}

export function saveLesson(lesson: Lesson, last: boolean = true) {
    const storable = lesson.storable();
    localStorage.setItem(storagePrefix + lesson.getLessonName(), JSON.stringify(storable));
    if (last) {
        localStorage.setItem(storagePrefix + 'last_lesson', lesson.getLessonName());
    }
}


async function loadDefaultLesson(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
    const lesson = getDefaultLessonFromLocale(config.lang.lang);
    return loadLesson(lesson, fetchFn);
}


// async function loadWordListLesson(lessonName: string, path: string, config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
//     const storable: StorableStockList = StockWordListLesson.newStorable(lessonName, path);
//     return StockWordListLesson.fromStorable(storable, fetchFn).then((s) => {
//         return s;
//     });
// }

