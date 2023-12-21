import { StockWordList, type StorableStockList } from './base/wordlist';
import { RandomList, type StorableRandom } from './wrappers/random';
import { UntilN, type StorableUntil } from './wrappers/until_n';
import { defaultLessonName } from '$lib/locales';
import { storagePrefix, Config, CheckMode } from '$lib/config';
import type { Language } from '$lib/language';
import { UserWordList, type StorableUserWordlist } from './base/user_wordlist';
import type { BaseWordList } from './base/wordlist_base';
import { AdaptiveList, type StorableAdaptive } from './base/adaptive_list';


export const stockLessons: Map<string, StorableBaseLesson> = new Map([
    ['en-test-words', StockWordList.newStorable('en-test-words', 'test_words.json', 'Test Words')],
    ['dvorak_en-US_1', StockWordList.newStorable('dvorak_en-US_1', 'dvorak_en-US/lesson_1_homerow_basic.json', 'Dvorak homerow')],
    ['dvorak_en-US_2', StockWordList.newStorable('dvorak_en-US_2', 'dvorak_en-US/lesson_2_homerow_basic.json', 'Dvorak homerow + widdle')],
    ['dvorak_en-US_3', StockWordList.newStorable('dvorak_en-US_3', 'dvorak_en-US/lesson_3_homerow_basic.json', 'Dvorak toprow')],
    ['dvorak_en-US_4', StockWordList.newStorable('dvorak_en-US_4', 'dvorak_en-US/lesson_4_homerow_basic.json', 'Dvorak toprow + middle')],
    ['dvorak_en-US_5', StockWordList.newStorable('dvorak_en-US_5', 'dvorak_en-US/lesson_5_homerow_basic.json', 'Dvorak bottomrow + middle')],
    ['dvorak_en-US_6', StockWordList.newStorable('dvorak_en-US_6', 'dvorak_en-US/lesson_6_homerow_basic.json', 'Dvorak bottomrow + middle')],
]);


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
