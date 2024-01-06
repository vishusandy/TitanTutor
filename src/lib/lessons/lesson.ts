import { StockWordList, type StorableStockList } from './base/stock_wordlist';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { defaultLessonName } from '$lib/data/locales';
import { storagePrefix, Config, CheckMode } from '$lib/types/config';
import type { Language } from '$lib/data/language';
import { UserWordList, type StorableUserWordlist } from './base/user_wordlist';
import type { BaseWordList } from './base/wordlist';
import { AdaptiveList, type StorableAdaptive } from './base/adaptive_list';
import { stockLessons } from '$lib/conf/lessons';
import { RandomChars, type StorableChars } from './base/chars';


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


export interface BaseLesson extends Lesson {
    id: string;
    name: string;
    getName(lang: Language): string;
}

export interface StorableBaseLesson extends StorableLesson {
    id: string;
}

export interface StorableLesson {
    type: 'wordlist' | 'random' | 'until' | 'userwordlist' | 'chars' | 'adaptive';
}

export abstract class Lesson implements Iterator<string>, Iterable<string> {
    abstract batch(n: number): string[];
    abstract toJSON(): string;
    abstract storable(): StorableLesson;
    abstract next(): IteratorResult<string>;
    abstract [Symbol.iterator](): typeof this;
    abstract getChild(): Lesson | undefined;
    abstract getType(): string;
    abstract baseLesson(): BaseLesson;
    abstract lessonEnd(): void;


    static canRandomize(type: string): boolean {
        return type === 'wordlist' || type === 'userwordlist';
    }

    static async deserialize(s: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        switch (s.type) {
            case 'wordlist':
                return StockWordList.fromStorable(s as StorableStockList, fetchFn);
            case 'chars':
                return RandomChars.fromStorable(s as StorableChars, fetchFn);
            case 'userwordlist':
                return UserWordList.fromStorable(s as StorableUserWordlist, fetchFn);
            case 'adaptive':
                return AdaptiveList.fromStorable(s as StorableAdaptive, fetchFn);
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

    static addWrappers(lesson: Lesson, opts: LessonTypingConfig): Lesson {
        let result: Lesson;

        if (opts.random === true && Lesson.canRandomize(lesson.baseLesson().getType())) {
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

    static async default(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const lesson = defaultLessonName(config.lang.lang);
        return Lesson.load(lesson, config, fetchFn);
    }

    static async load(id: string, config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        if (id.startsWith('user_')) {
            const storable = localStorage.getItem(userLessonPrefix + id);
            if (storable === null) throw new Error(`Could not find user lesson '${id}'`);
            return Lesson.deserializeFromConfig(id, JSON.parse(storable), config, fetchFn);
        }

        const storable = stockLessons.get(id);

        if (storable === undefined)
            throw new Error(`Could not find lesson '${id}'`);
        return Lesson.deserializeFromConfig(id, storable, config, fetchFn);
    }

    static async getLast(config: Config, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const lastLesson = localStorage.getItem(lastLessonPrefix);

        if (lastLesson === null)
            return Lesson.default(config, fetchFn);

        return Lesson.load(lastLesson, config, fetchFn);
    }

    static getOverrides(id: string): Partial<LessonTypingConfig> {
        const opts = localStorage.getItem(`${lessonOptionsPrefix}${id}`);

        return (opts !== null) ? JSON.parse(opts) : {};
    }

    static saveOverrides(id: string, overrides: Partial<LessonTypingConfig>) {
        localStorage.setItem(`${lessonOptionsPrefix}${id}`, JSON.stringify(overrides));
    }

    static async deserializeFromOverrides(s: StorableBaseLesson, opts: LessonTypingConfig, fetchFn: typeof fetch = fetch) {
        let storable: StorableLesson = s;

        if (opts.random && Lesson.canRandomize(s.type)) {
            storable = RandomList.newStorable(storable);
        }

        if (opts.until !== null) {
            storable = UntilN.newStorable(storable, opts.until);
        }

        return Lesson.deserialize(storable, fetchFn);

    }

    static async deserializeFromConfig(id: string, s: StorableBaseLesson, config: Config, fetchFn: typeof fetch = fetch) {
        const opts = config.lessonConfigOverrides(Lesson.getOverrides(id));

        return Lesson.deserializeFromOverrides(s, opts, fetchFn);
    }

    static save(lesson: Lesson, saveAsLastLesson: boolean = true) {
        const storable = lesson.storable();
        localStorage.setItem(userLessonPrefix + lesson.baseLesson().id, JSON.stringify(storable));

        if (saveAsLastLesson) {
            Lesson.saveLast(lesson);
        }
    }

    static saveLast(lesson: Lesson) {
        localStorage.setItem(lastLessonPrefix, lesson.baseLesson().id);
    }
}

export function defaultBatch(lesson: Lesson, n: number) {
    let words: string[] = [];

    let word: string, iter = lesson.next(), i = 0;
    while (i < n && iter.done !== true && (word = iter.value)) {
        words.push(word);
        iter = lesson.next();
        i += 1;
    }

    return words;
}
