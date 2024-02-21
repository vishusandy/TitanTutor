import { defaultLessonName } from '$lib/data/locales';
import type { Config } from '$lib/types/config';
import type { Language } from '$lib/data/language';
import { loadUserLesson } from './base/user_wordlist';
import { stockLessons } from '$lib/conf/lessons';
import type { LessonOptsAvailable } from '$lib/types/forms';
import { get, lesson_opts_store } from '$lib/db';
import type { StorableLesson, StorableBaseLesson, LessonTypingConfig } from '../types/lessons';
import { addWrappers, baseClasses, wrapperClasses } from '$lib/data/lesson_classes';
import type { WordState } from '$lib/word_state';
import type { LessonStats } from '$lib/stats';
import type { Action } from '$lib/types/types';


export interface BaseLesson extends Lesson {
    id: string;
    name: string;
    getName(lang: Language): string;
    language(): string;
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
    abstract overrides(): LessonOptsAvailable;
    abstract handleInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action;
    abstract handleKeydown(e: KeyboardEvent, config: Config, word: WordState, stats: LessonStats): Action;

    static async default(config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const lesson = defaultLessonName(config.lang.lang);
        return Lesson.load(lesson, config, db, fetchFn);
    }

    static async deserialize(s: StorableLesson, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        for (const c of baseClasses) {
            if (s.type === c.getTypeId()) {
                return c.fromStorable(s as any, fetchFn);
            }
        }
        for (const c of wrapperClasses) {
            if (s.type === c.getTypeId()) {
                return c.fromStorable(s as any, db, fetchFn);
            }
        }
        throw new Error(`Attempted to load lesson with invalid type`);
    }

    static async deserializeAndBuild(id: string, s: StorableBaseLesson, config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const o = await Lesson.getLessonOptions(id, db);
        const opts = config.lessonOptions(o);
        const base = await Lesson.deserialize(s, db, fetchFn);
        return addWrappers(base, config, db, opts);
    }

    static async load(id: string, config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        if (id.startsWith('user_')) {
            return loadUserLesson(config, db, id, fetchFn);
        }

        const storable = stockLessons.get(id);
        if (storable === undefined)
            throw new Error(`Could not find lesson '${id}'`);
        return Lesson.deserializeAndBuild(id, storable, config, db, fetchFn);
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
        s.put({ lesson_id: id, ...opts });
    }

    static saveLast(lesson: Lesson, config: Config, db: IDBDatabase) {
        config.lastLesson = lesson.baseLesson().id;
        config.saveUserConfig(db);
    }

    static printWrappers(lesson: Lesson) {
        let l: Lesson, c: Lesson | undefined = lesson;
        do {
            l = c;
            console.log(`wrapper: ${l.getType()}`);
            c = l.getChild();
        } while (c !== undefined);
    }

    static hasWrapper(lesson: Lesson, wrapperId: string): boolean {
        let l: Lesson, c: Lesson | undefined = lesson;
        do {
            l = c;
            if (l.getType() === wrapperId) return true;
            c = l.getChild();
        } while (c !== undefined);
        return false;
    }
}
