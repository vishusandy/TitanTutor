import { LessonData } from "$lib/lessons/lessons"

export async function load({ fetch }) {
    let [lesson, lessonOpts] = await LessonData.loadUserLesson(fetch);
    return {
        lesson,
        lessonOpts,
    }
}
