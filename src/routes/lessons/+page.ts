import type { LayoutData } from "../$types";

import { loadUserConfig } from "$lib/config";
import { list, user_lessons_store } from '$lib/db';
import type { StorableUserWordlist } from "$lib/lessons/base/user_wordlist";


export async function load({ parent, fetch }: { parent: () => Promise<LayoutData>, fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {
    const { db } = await parent();
    let config = await loadUserConfig(db);
    let customLessons = await list<StorableUserWordlist>(db, user_lessons_store) ?? [];
    return { config, customLessons };
}
