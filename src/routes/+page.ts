import { LessonData } from "$lib/lessons/lessons"

export async function load() {
    let [lesson, lessonOpts] = await LessonData.loadCurrentLesson();
    return {
        lesson,
        lessonOpts,
    }
}
