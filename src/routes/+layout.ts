export const prerender = true;
export const ssr = false;

import { Config, configKey } from "$lib/types/config";
import { showVoiceDialog } from '$lib/util/dialog';
import type { Audio } from '$lib/audio';

export async function load({ fetch }) {
    let config = await Config.loadUserConfig(fetch);

    if (localStorage.getItem(configKey) === null) {
        await showVoiceDialog(config).then((audio?: Audio) => {
            if (audio !== undefined) {
                config.tts = audio;
                config.saveUserConfig();
            }
        });
    }

    return {
        config,
    };
}
