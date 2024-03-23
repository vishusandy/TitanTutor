import { defaultUserId } from "./conf/config";

const DB_NAME = 'titantutor';
const DB_VERSION = 2;

export const config_store = 'user_config';
export const lesson_opts_store = 'lesson_options';
export const user_lessons_store = 'user_lessons';
export const adaptive_store = 'adaptive';

const stores = [
    { store: 'user_config', key: 'user' },
    { store: 'lesson_options', key: 'lesson_id' },
    { store: 'user_lessons', key: 'id' },
    { store: 'adaptive', key: 'lesson_id' },
];

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
                for (const s of stores) {
                    const objStore = db.createObjectStore(s.store, { keyPath: s.key });
                    objStore.createIndex(s.key, s.key, { unique: true });
                }
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
                        db.deleteObjectStore(config_store);
                        db.createObjectStore(config_store, { keyPath: 'user' })
                            .createIndex('user', 'user', { unique: true });
                    }
                }
            }
        }
    });
}

function reset(db: IDBDatabase) {
    for (const s of stores) {
        db.deleteObjectStore(s.store);
    }
}

export function clearAll(db: IDBDatabase) {
    for (const s of stores) {
        const trans = db.transaction(s.store, 'readwrite');
        const obj = trans.objectStore(s.store);
        obj.clear();
    }
}

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
