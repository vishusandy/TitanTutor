export const prerender = true;
export const ssr = false;

import { Config } from "$lib/config";

export async function load({ fetch }) {
    let config = await Config.loadUserConfig(fetch);

    return {
        config,
    };
}
