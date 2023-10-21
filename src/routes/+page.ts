import { getLastLesson } from "$lib/lessons/lessons"

export async function load({ parent, fetch }) {
    const { config } = await parent();
    let lesson = await getLastLesson(config, fetch);

    return { lesson };
}
