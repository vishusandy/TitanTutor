export const ssr = false;
export const prerender = false;

import { Config } from "$lib/types/config";
import { showVoiceDialog } from '$lib/util/dialog';
import type { Audio } from '$lib/audio';
import { connect } from "$lib/db.js";


export async function load({ fetch }) {

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
