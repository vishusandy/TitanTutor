import { loadUserLesson } from "$lib/lessons/lessons"

export async function load({ parent, fetch }) {
    const { config } = await parent();
    let lesson = await loadUserLesson(config, fetch);

    return { lesson };
}
