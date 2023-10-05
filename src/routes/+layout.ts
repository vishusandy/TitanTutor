export const prerender = true;
export const ssr = false;

import { Config } from "$lib/config";
import { Language } from "$lib/language";
import { loadUserKbMap } from "$lib/remap";

export async function load({ fetch }) {
    let config = Config.loadUserConfig();
    let lang = await Language.loadUserLang(fetch);
    let kbmap = await loadUserKbMap(fetch);

    return {
        config,
        lang,
        kbmap,
    };
}
