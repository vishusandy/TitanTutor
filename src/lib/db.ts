import { defaultUserId } from "./conf/config";
import { defaultStorable } from "./data/config";
import { defaultLessonName } from "./data/locales";

const DB_NAME = 'vktutor';
const DB_VERSION = 2;

export const config_store = 'user_config';
export const lesson_opts_store = 'lesson_options';
export const user_lessons_store = 'user_lessons';
export const adaptive_store = 'adaptive';


export function connect(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onsuccess = function (e) {
            // @ts-ignore
            resolve(e.target.result);
        };

        req.onerror = function (e) {
            reject('could not connect to db');
        }

        req.onupgradeneeded = async (e: IDBVersionChangeEvent) => {
            // @ts-ignore
            const db: IDBDatabase = e.target.result;
            // @ts-ignore
            const t: IDBTransaction = e.target.transaction;

            if (e.oldVersion < 1) {
                const conf = db.createObjectStore(config_store, { keyPath: 'user' });
                conf.createIndex('user', 'user', { unique: true });
                const config = defaultStorable();
                t.objectStore(config_store).put(config)

                const defaultLesson = defaultLessonName(config.lang);

                const lesson_opts = db.createObjectStore(lesson_opts_store, { keyPath: 'lesson_id' });
                lesson_opts.createIndex('lesson_id', 'lesson_id', { unique: true });
                t.objectStore(lesson_opts_store).put({ lesson_id: defaultLesson });

                const user_lessons = db.createObjectStore(user_lessons_store, { keyPath: 'id' });
                user_lessons.createIndex('id', 'id', { unique: true });

                const adaptive = db.createObjectStore(adaptive_store, { keyPath: 'lesson_id' });
                adaptive.createIndex('lesson_id', 'lesson_id', { unique: true });
            } else {
                if (e.oldVersion === 1) {
                    const store = t.objectStore(config_store);
                    const req = store.get(defaultUserId);
                    req.onsuccess = (e: Event) => {
                        const c = req.result;
                        c.shortucts = { stop: c.stop, pause: c.pause };
                        c.stop = undefined;
                        c.pause = undefined;
                        store.put(c);
                    };
                    req.onerror = async (e) => {
                        const config = defaultStorable();
                        store.put(config);
                    }
                }
            }
            // resolve(db);
        }
    });
}

function reset(db: IDBDatabase) {
    const stores = [
        'user_config',
        'lesson_options',
        'user_lessons',
        'adaptive',
    ];

    for (const s of stores) {
        db.deleteObjectStore(s);
    }
}


// export function getCallback<Result, Success, Err>(db: IDBDatabase, store_name: string, key: any, getValue: (res: Result) => Success, getDefault: () => Success, onError: (e: Event) => Err): Promise<Success | Err> {
//     // https://stackoverflow.com/questions/52836721/await-for-indexdb-event-in-async-function
//     return new Promise((resolve, reject) => {
//         let result: Success | Err;
//         const t = db.transaction(store_name, 'readonly');

//         t.oncomplete = _ => resolve(result);
//         // @ts-ignore
//         t.onerror = e => reject(e.target?.error);

//         const store = t.objectStore(store_name);
//         const req = store.get(key);
//         req.onsuccess = _ => {
//             const rst = req.result;
//             if (rst !== undefined) {
//                 result = getValue(req.result);
//             } else {
//                 result = getDefault();
//             }
//         }
//         req.onerror = e => result = onError(e);
//     });
// }

export function get<T>(db: IDBDatabase, store: string, key: string): Promise<T | undefined> {
    let result: T;
    let err: boolean = false;

    return new Promise((resolve, reject) => {
        const trans = db.transaction(store, 'readonly');
        trans.oncomplete = () => (!err) ? resolve(result) : resolve(undefined);
        trans.onerror = () => resolve(undefined);

        const req = trans.objectStore(store).get(key);
        req.onsuccess = () => result = req.result;
        req.onerror = () => err = true;
    });
}

export function save<T>(db: IDBDatabase, store_name: string, data: T) {
    const t = db.transaction([store_name], "readwrite");
    const store = t.objectStore(store_name);
    store.put(data);
}
