const DB_NAME = 'vktutor';
const DB_VERSION = 1;

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

        req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
            // @ts-ignore
            const db = e.target.result;
            const conf = db.createObjectStore('user_config', { keyPath: 'user' });
            conf.createIndex('user', 'user', { unique: true });

            const lesson_opts = db.createObjectStore('lesson_options', { keyPath: 'lesson_id' });
            lesson_opts.createIndex('lesson_id', 'lesson_id', { unique: true });

            const user_lessons = db.createObjectStore('user_lessons', { keyPath: 'id' });
            user_lessons.createIndex('id', 'id', { unique: true });

            const adaptive = db.createObjectStore('adaptive', { keyPath: 'lesson_id' });
            adaptive.createIndex('lesson_id', 'lesson_id', { unique: true });
            resolve(db);
        }
    });
}


export function get<Result, Success, Err>(db: IDBDatabase, store_name: string, key: any, getValue: (res: Result) => Success, getDefault: () => Success, onError: (e: Event) => Err): Promise<Success | Err> {
    // https://stackoverflow.com/questions/52836721/await-for-indexdb-event-in-async-function
    return new Promise((resolve, reject) => {
        let result: Success | Err;
        const t = db.transaction(store_name, 'readonly');

        t.oncomplete = _ => resolve(result);
        // @ts-ignore
        t.onerror = e => reject(e.target?.error);

        const store = t.objectStore(store_name);
        const req = store.get(key);
        req.onsuccess = _ => {
            const rst = req.result;
            // console.log(`store: ${store_name} value: ${req.result}`, v)
            if (rst !== undefined) {
                result = getValue(req.result);
            } else {
                result = getDefault();
            }
        }
        req.onerror = async e => result = onError(e);
    });
}

