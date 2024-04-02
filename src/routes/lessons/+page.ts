import type { LayoutData } from "../$types";

import { loadUserConfig } from "$lib/config";
import { lesson_stats_store, list, user_lessons_store } from '$lib/db';
import type { StorableUserWordlist } from "$lib/lessons/base/user_wordlist";
import type { StatsLog } from "$lib/stats";



export async function load({ parent, fetch }: { parent: () => Promise<LayoutData>, fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {
    const { db } = await parent();
    const config = await loadUserConfig(db);
    const customLessons = await list<StorableUserWordlist>(db, user_lessons_store) ?? [];
    const allStatsLogs: StatsLog[] | undefined = await list(db, lesson_stats_store);
    // let settings = await list<Overrides>(db, lesson_opts_store);
    // const lessonSettings: Map<string, Partial<LessonTypingConfig>> = new Map();
    // if (settings !== undefined) {
    //     for (const s of settings) {
    //         const { id, ...opts } = s;
    //         lessonSettings.set(id, opts);
    //     }
    // }
    return { config, customLessons, allStatsLogs };
}
