export const prerender = true;
export const ssr = false;

import { Config } from "$lib/config";
import { Language } from "$lib/language";
import { loadUserKbMap } from "$lib/mappings";

export async function load() {
    let config = Config.load();
    let lang = await Language.loadUserLang();
    let kbmap = await loadUserKbMap();

    return {
        config,
        lang,
        kbmap,
    };
}
