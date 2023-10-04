export const prerender = true;
export const ssr = false;

import { Config } from "$lib/config";

export function load() {
    return {
        config: Config.load(),
    };
}
