export const ssr = false;
export const prerender = false;

import { Config } from "$lib/types/config";
import { connect } from "$lib/db.js";

// import { showVoiceDialog } from '$lib/util/dialog';
// import type { Audio } from '$lib/audio';


export async function load({ fetch }: { fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> }) {

    let db = await connect();
    let config = await Config.loadUserConfig(db);
    // if (localStorage.getItem(configKey) === null) {
    //     await showVoiceDialog(config, db).then((audio?: Audio) => {
    //         if (audio !== undefined) {
    //             config.tts = audio;
    //             config.saveUserConfig(db);
    //         }
    //     });
    // }

    return {
        db,
        config,
    };
}
