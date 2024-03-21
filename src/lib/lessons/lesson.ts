import { defaultLessonName } from '$lib/data/locales';
import type { Config } from '$lib/config';
import type { Language } from '$lib/data/language';
import { loadUserLesson } from './base/user_wordlist';
import { stockLessons } from '$lib/conf/lessons';
import type { LessonOptsAvailable } from '$lib/types/forms';
import { get, lesson_opts_store } from '$lib/db';
import type { StorableLesson, StorableBaseLesson, LessonTypingConfig } from '../types/lessons';
import { addWrappers, getLessonClass } from '$lib/data/lesson_classes';
import type { WordState } from '$lib/word_state';
import type { LessonStats } from '$lib/stats';
import type { Action } from '$lib/types/types';

/**
 * A {@link Lesson} that can be used on its own or stored in other wrapper classes.
 */
export interface BaseLesson extends Lesson {
    id: string;
    name: string;
    getName(lang: Language): string;
    language(): string;
}

/**
 * A generic lesson that may be a wrapper class or a {@link BaseLesson} class.
 */
export abstract class Lesson implements Iterator<string>, Iterable<string> {
    /**
     * Get a batch of new words to add to the queue.
     * @param {number} n - the number of words to retrieve
     * @returns {string[]} returns an array of new words
     */
    abstract batch(n: number): string[];

    /**
     * Ensures the lesson has a `toJSON()` method for serialization.
     */
    abstract toJSON(): string;

    /**
     * Create an object that can store the lesson in a serialized form.
     * @returns {StorableLesson} returns a storable object
     */
    abstract storable(): StorableLesson;

    /**
     * Iterate through a lesson's words
     * @returns {IteratorResult} returns an {@link IteratorResult} of type `string`
     */
    abstract next(): IteratorResult<string>;

    /**
     * Allow the lesson to be used as an iterator.
     */
    abstract [Symbol.iterator](): typeof this;

    /**
     * Returns a child lesson if the {@link Lesson} instance is a wrapper class.
     * @returns returns either a {@link Lesson} or `undefined`
     */
    abstract getChild(): Lesson | undefined;

    /**
     * Retrieve the storable ID used to identify the current class.
     * @returns returns the storable ID of the class
     */
    abstract getType(): string;

    /**
     * Retrieve the base lesson.  If the instance is a {@link BaseLesson} it will return itself.
     * @returns {BaseLesson} returns a base lesson class
     */
    abstract baseLesson(): BaseLesson;

    /**
     * Identifies which lesson options can be set by the user and which are disabled or forced to a specific value
     * @returns {LessonOptsAvailable} returns the available lesson options
     */
    abstract overrides(): LessonOptsAvailable;

    /**
     * Handle user input (typing).
     * @param {InputEvent} e - the {@link InuptEvent} triggered by the user
     * @param {Config} config - the user's settings
     * @param {WordState} word - the {@link WordState} that tracks typing progress for the current word
     * @param {LessonStats} stats - the stats for the current lesson's session
     * @returns {Action} - returns a number representing which actions were/should be taken
     */
    abstract handleInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action;

    /**
     * Handles end of word checks as well as backspace, space, and enter keys.
     * @param {InputEvent} e - the {@link InuptEvent} triggered by the user
     * @param {Config} config - the user's settings
     * @param {WordState} word - the {@link WordState} that tracks typing progress for the current word
     * @param {LessonStats} stats - the stats for the current lesson's session
     * @returns {Action} - returns a number representing which actions were/should be taken
     */
    abstract handleKeydown(e: KeyboardEvent, config: Config, word: WordState, stats: LessonStats): Action;

    /**
     * Loads the default lesson.  This is used when the last lesson is not set.
     * @param {Config} config - the user's settings
     * @param {IDBDatabase} db - the IndexedDB connection to use
     * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
     * @returns {Promise} returns a promise that will yield a {@link Lesson} instance
     */
    static async default(config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const lesson = defaultLessonName(config.lang.lang);
        return Lesson.load(lesson, config, db, fetchFn);
    }

    /**
     * Deserialize a {@link Lesson} from its {@link StorableLesson}.
     * @param {StorableLesson} storable - the storable object that represents the desired {@link Lesson}
     * @param {IDBDatabase} db - the IndexedDB connection to use
     * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
     * @returns {Promise} returns a promise that will yield a {@link Lesson} instance
     */
    static async deserialize(storable: StorableLesson, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const c = getLessonClass(storable.type);
        if (c === undefined) {
            throw new Error(`Attempted to load lesson with invalid type: '${storable.type}'`);
        }
        return c.fromStorable(storable, db, fetchFn);
    }

    /**
     * Deserialize a {@link BaseLesson} from its {@link StorableBaseLesson} and add appropriate wrapper classes.
     * @param id - the lesson ID
     * @param {StorableBaseLesson} storable - the storable object that represents the desired {@link BaseLesson}
     * @param {Config} config - the user's settings
     * @param {IDBDatabase} db - the IndexedDB connection to use
     * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
     * @returns {Promise} returns a promise that will yield a {@link Lesson} instance
     */
    static async deserializeAndBuild(id: string, storable: StorableBaseLesson, config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        const o = await Lesson.getLessonOptions(id, db);
        const opts = config.lessonOptions(o);
        const base = await Lesson.deserialize(storable, db, fetchFn);
        return addWrappers(base, config, db, opts);
    }

    /**
     * Loads a lesson specified by the lesson ID.
     * @param {string} id - the ID of the desired lesson
     * @param {Config} config - the user's settings
     * @param {IDBDatabase} db - the IndexedDB connection to use
     * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
     * @returns {Promise} returns a promise that will yield a {@link Lesson} instance
     */
    static async load(id: string, config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        if (id.startsWith('user_')) {
            return loadUserLesson(config, db, id, fetchFn);
        }

        const storable = stockLessons.get(id);
        if (storable === undefined)
            throw new Error(`Could not find lesson '${id}'`);
        return Lesson.deserializeAndBuild(id, storable, config, db, fetchFn);
    }

    /**
     * Loads the last lesson, or the default if no lesson has been previously loaded.
     * @param {Config} config - the user's settings
     * @param {IDBDatabase} db - the IndexedDB connection to use
     * @param [fetchFn=fetch] - an optional function to handle fetching data (used when SSR is turned on in Svelte)
     * @returns {Promise} returns a promise that will yield a {@link Lesson} instance
     */
    static async loadLast(config: Config, db: IDBDatabase, fetchFn: typeof fetch = fetch): Promise<Lesson> {
        if (config.lastLesson === null) {
            return Lesson.default(config, db, fetch);
        } else {
            return Lesson.load(config.lastLesson, config, db, fetchFn);
        }
    }

    /**
     * Retrieve the user's stored lesson settings for the specified lesson.
     * @param {string} id - the ID of the lesson to retrieve settings for
     * @param {IDBDatabase} db - the IndexedDB connection to use
     * @returns {Promise} returns a promise that will yield a {@link LessonTypingConfig} object
     */
    static async getLessonOptions(id: string, db: IDBDatabase): Promise<Partial<LessonTypingConfig>> {
        const data = await get<Partial<LessonTypingConfig>>(db, lesson_opts_store, id);
        if (data === undefined) {
            return new Object() as Partial<LessonTypingConfig>;
        }
        return (data);

        // return getCallback<Partial<LessonTypingConfig>, Partial<LessonTypingConfig>, Partial<LessonTypingConfig>>(
        //     db, lesson_opts_store, id,
        //     (res: Partial<LessonTypingConfig>) => res,
        //     () => new Object() as Partial<LessonTypingConfig>,
        //     () => new Object() as Partial<LessonTypingConfig>,
        // );
    }

    /**
     * Save the user's lesson settings.
     * @param {string} id - the ID of the lesson
     * @param {Partial<LessonTypingConfig>} opts - the lesson options to save
     * @param {IDBDatabase} db - the IndexedDB connection to use
     */
    static saveLessonOptions(id: string, opts: Partial<LessonTypingConfig>, db: IDBDatabase) {
        const t = db.transaction(lesson_opts_store, "readwrite");
        const s = t.objectStore(lesson_opts_store);
        s.put({ lesson_id: id, ...opts });
    }

    /**
     * Mark the specified lesson as the last lesson loaded.
     * @param {Lesson} lesson - the current lesson
     * @param {Config} config - the user's settings
     * @param {IDBDatabase} db - the IndexedDB connection to use
     */
    static saveLast(lesson: Lesson, config: Config, db: IDBDatabase) {
        config.lastLesson = lesson.baseLesson().id;
        config.saveUserConfig(db);
    }

    /**
     * Debugging method to list all of the wrapper classes and the base class.
     * @param {Lesson} lesson - the lesson to print wrappers for
     */
    static printWrappers(lesson: Lesson) {
        let l: Lesson, c: Lesson | undefined = lesson;
        do {
            l = c;
            console.log(`wrapper: ${l.getType()}`);
            c = l.getChild();
        } while (c !== undefined);
    }

    /**
     * Check if a lesson contains a specified wrapper or base class.
     * @param {Lesson} lesson - the topmost class that may contain child lessons
     * @param {string} id - the ID to check
     * @returns {boolean} returns whether the class ID is contained within the given lesson
     */
    static hasClass(lesson: Lesson, id: string): boolean {
        let l: Lesson, c: Lesson | undefined = lesson;
        do {
            l = c;
            if (l.getType() === id) return true;
            c = l.getChild();
        } while (c !== undefined);
        return false;
    }

    /**
     * Check if a lesson contains a specified wrapper or base class and returns it if found.
     * @param {Lesson} lesson - the topmost class that may contain child lessons
     * @param {string} id - the ID to check
     * @returns {boolean} returns the lesson class if found, otherwise returns null
     */
    static getClass(lesson: Lesson, id: string): Lesson | null {
        let l: Lesson, c: Lesson | undefined = lesson;
        do {
            l = c;
            if (l.getType() === id) return l;
            c = l.getChild();
        } while (c !== undefined);
        return null;
    }
}
