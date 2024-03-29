import { loadUserConfig } from "$lib/config";
import { Lesson } from "$lib/lessons/lesson"
import type { LayoutData } from "./$types";

export async function load({ parent, fetch }: { parent: () => Promise<LayoutData>, fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {
    const { db } = await parent();
    let config = await loadUserConfig(db);
    let lesson = await Lesson.loadLast(config, db, fetch);
    let lessonOpts = await Lesson.getLessonOptions(lesson.baseLesson().id, db);
    return { config, lesson, lessonOpts };
}
