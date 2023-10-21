import { loadLastLesson } from "$lib/lessons/lessons"

export async function load({ parent, fetch }) {
    const { config } = await parent();
    let lesson = await loadLastLesson(config, fetch);

    return { lesson };
}
