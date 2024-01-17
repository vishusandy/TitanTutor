import { Lesson } from "$lib/lessons/lesson"

export async function load({ parent, fetch }) {
    const { config, db } = await parent();
    let lesson = await Lesson.loadLast(config, db, fetch);
    let lessonOpts = await Lesson.getLessonOptions(lesson.baseLesson().id, db);
    return { lesson, lessonOpts };
}
