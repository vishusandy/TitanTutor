import { StockWordList } from './base/stock_wordlist';
import { RandomList } from './wrappers/random';
import { UntilN } from './wrappers/until_n';
import { defaultLessonName } from '$lib/data/locales';
import type { Config, CheckMode } from '$lib/types/config';
import type { Language } from '$lib/data/language';
import { UserWordList, loadUserLesson } from './base/user_wordlist';
import type { BaseWordList } from './base/wordlist';
import { AdaptiveList } from './base/adaptive_list';
import { stockLessons } from '$lib/conf/lessons';
import { RandomChars } from './base/chars';
import type { LessonOptsAvailable } from '$lib/types/forms';
import { get, lesson_opts_store } from '$lib/db';

export const lessonClasses = [
    StockWordList,
    UserWordList,
    RandomChars,
    AdaptiveList,
    RandomList,
    UntilN
];

export type LessonWrapperConfig = {
    random: boolean,
    until: number | null,
    adaptive: boolean,
};

export type LessonTypingConfig = LessonWrapperConfig & {
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
    type: string;
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
    abstract overrides(): LessonOptsAvailable;


    static addWrappers(lesson: Lesson, opts: LessonTypingConfig): Lesson {
        let result: Lesson;

        // TODO: add wrappers in a better way
        if (opts.random === true && Lesson.allowRandom(lesson.baseLesson().getType())) {
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

    static allowRandom(type: string): boolean {
        return type === 'wordlist' || type === 'userwordlist';
    }

    static async deserialize(s: StorableLesson, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        for (const c of lessonClasses) {
            if (s.type === c.getTypeId()) {
                return c.fromStorable(s as any, fetchFn);
            }
        }
        throw new Error(`Attempted to load lesson with invalid type`);
    }

    static async default(config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const lesson = defaultLessonName(config.lang.lang);
        return Lesson.load(lesson, config, db, fetchFn);
    }

    static async load(id: string, config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        if (id.startsWith('user_')) {
            return loadUserLesson(config, db, id, fetchFn);
        }

        const storable = stockLessons.get(id);
        if (storable === undefined)
            throw new Error(`Could not find lesson '${id}'`);
        return Lesson.deserializeFromConfig(id, storable, config, db, fetchFn);
    }

    static async loadLast(config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        if (config.lastLesson === null) {
            return Lesson.default(config, db, fetch);
        } else {
            return Lesson.load(config.lastLesson, config, db, fetchFn);
        }
    }

    static async getLessonOptions(id: string, db: IDBDatabase): Promise<Partial<LessonTypingConfig>> {
        return get<Partial<LessonTypingConfig>, Partial<LessonTypingConfig>, Partial<LessonTypingConfig>>(
            db, lesson_opts_store, id,
            (res: Partial<LessonTypingConfig>) => res,
            () => new Object() as Partial<LessonTypingConfig>,
            () => new Object() as Partial<LessonTypingConfig>,
        );
    }

    static saveLessonOptions(id: string, opts: Partial<LessonTypingConfig>, db: IDBDatabase) {
        const t = db.transaction(lesson_opts_store, "readwrite");
        const s = t.objectStore(lesson_opts_store);
        s.put(opts);
    }

    static async deserializeFromConfig(id: string, s: StorableBaseLesson, config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const o = await Lesson.getLessonOptions(id, db);
        const opts = config.lessonOptions(o);
        let storable: StorableLesson = s;

        // TODO: add wrappers in better way
        if (opts.random && Lesson.allowRandom(s.type)) {
            storable = RandomList.newStorable(storable);
        }

        if (opts.until !== null) {
            storable = UntilN.newStorable(storable, opts.until);
        }

        return Lesson.deserialize(storable, fetchFn);
    }

    static saveLast(lesson: Lesson, config: Config, db: IDBDatabase) {
        config.lastLesson = lesson.baseLesson().id;
        config.saveUserConfig(db);
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
