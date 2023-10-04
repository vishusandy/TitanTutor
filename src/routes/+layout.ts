export const prerender = true;
export const ssr = false;

import { Config } from "$lib/config";
import { Language } from "$lib/language";

export async function load() {
    let config = Config.load();
    let lang = await Language.loadUserLang();

    return {
        config,
        lang,
    };
}
