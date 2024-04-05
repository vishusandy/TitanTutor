import { defaultUserId } from "./conf/config";
import { LogStats } from "./types/config";

const DB_NAME = 'titantutor';
const DB_VERSION = 4;

export const config_store = 'user_config';
export const lesson_opts_store = 'lesson_options';
export const user_lessons_store = 'user_lessons';
export const adaptive_store = 'adaptive';
export const lesson_stats_store = 'lesson_stats';

type StoreType = {
    store: string,
    key: string,
    autoIncrement: boolean,
};


const stores: StoreType[] = [
    { store: config_store, key: 'user', autoIncrement: false },
    { store: lesson_opts_store, key: 'lesson_id', autoIncrement: false },
    { store: user_lessons_store, key: 'id', autoIncrement: true },
    { store: adaptive_store, key: 'lesson_id', autoIncrement: false },
    { store: lesson_stats_store, key: 'lesson_id', autoIncrement: false },
];

function createStore(db: IDBDatabase, s: StoreType) {
    const objStore = db.createObjectStore(s.store, { keyPath: s.key, autoIncrement: s.autoIncrement });
    objStore.createIndex(s.key, s.key, { unique: true });
}

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
                    createStore(db, s);
                }
            } else {
                // version 2 moved shortcuts from Config propreties to an object
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
                
                // version 3 created lesson_stats_store and changed user_lessons_store to be autoIncrementing
                if (e.oldVersion <= 2) {
                    // user lessons could not be added at this time so this is safe
                    db.deleteObjectStore(user_lessons_store);
                    createStore(db, { store: user_lessons_store, key: 'id', autoIncrement: true });
                    createStore(db, { store: lesson_stats_store, key: 'lesson_id', autoIncrement: false })
                }
                
                // version 4 changed logStats from boolean to a const enum
                if (e.oldVersion <= 3) {
                    const store = t.objectStore(config_store);
                    const req = store.get(defaultUserId);
                    req.onsuccess = (e: Event) => {
                        const c = req.result;
                        if(c !== undefined) {
                            c.logStats = c.logStats === true? LogStats.Always: LogStats.Off;
                            store.put(c);
                        }
                    };
                    req.onerror = () => {
                        db.deleteObjectStore(config_store);
                        createStore(db, { store: config_store, key: 'user', autoIncrement: false });
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

export function addUpdate<T>(db: IDBDatabase, store_name: string, data: T): Promise<any | undefined> {
    let result: any = undefined;
    return new Promise((resolve) => {
        const t = db.transaction([store_name], "readwrite");
        t.oncomplete = () => resolve(result);
        t.onerror = () => resolve(undefined);

        const req = t.objectStore(store_name).put(data);
        req.onsuccess = () => { result = req.result };
    });
}

export function list<T>(db: IDBDatabase, store_name: string): Promise<T[] | undefined> {
    let result: T[];
    let err: boolean = false;

    return new Promise((resolve) => {
        const t = db.transaction([store_name], 'readonly');
        t.oncomplete = () => (!err) ? resolve(result) : resolve(undefined);
        t.onerror = () => resolve(undefined);

        const req = t.objectStore(store_name).getAll();
        req.onsuccess = () => result = req.result;
        req.onerror = () => err = true;
    });
}

export function remove(db: IDBDatabase, store_name: string, key: string): Promise<string | undefined> {
    return new Promise((resolve) => {
        const t = db.transaction(store_name, 'readwrite');
        t.oncomplete = () => resolve(key);
        t.onerror = () => resolve(undefined);

        t.objectStore(store_name).delete(key);
    });
}
