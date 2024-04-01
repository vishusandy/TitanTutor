import { loadUserConfig } from "$lib/config";
import { get, lesson_stats_store, list, user_lessons_store } from "$lib/db";
import type { StorableUserWordlist } from "$lib/lessons/base/user_wordlist";
import { Lesson } from "$lib/lessons/lesson"
import type { StatsLog } from "$lib/stats";
import type { LayoutData } from "./$types";

export async function load({ parent, fetch }: { parent: () => Promise<LayoutData>, fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {
    const { db } = await parent();
    let config = await loadUserConfig(db);
    let lesson = await Lesson.loadLast(config, db, fetch);
    let lessonOpts = await Lesson.getLessonOptions(lesson.baseLesson().id, db);
    // let lessonStatsLog = await get<StatsLog>(db, lesson_stats_store, lesson.baseLesson().id);
    let customLessons = await list<StorableUserWordlist>(db, user_lessons_store) ?? [];
    return { config, lesson, lessonOpts, customLessons };
}
