import type { LayoutData } from "../$types";

import { loadUserConfig } from "$lib/config";
import { lesson_opts_store, list, user_lessons_store } from '$lib/db';
import type { StorableUserWordlist } from "$lib/lessons/base/user_wordlist";
import type { LessonTypingConfig } from "$lib/types/lessons";



export async function load({ parent, fetch }: { parent: () => Promise<LayoutData>, fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {
    const { db } = await parent();
    let config = await loadUserConfig(db);
    let customLessons = await list<StorableUserWordlist>(db, user_lessons_store) ?? [];
    // let settings = await list<Overrides>(db, lesson_opts_store);
    // const lessonSettings: Map<string, Partial<LessonTypingConfig>> = new Map();
    // if (settings !== undefined) {
    //     for (const s of settings) {
    //         const { id, ...opts } = s;
    //         lessonSettings.set(id, opts);
    //     }
    // }
    return { config, customLessons };
}
