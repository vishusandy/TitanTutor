export const prerender = true;
export const ssr = false;

import { Config, storagePrefix } from "$lib/config";
import { showVoiceDialog } from '$lib/dialog';
import type { Audio } from '$lib/audio';

export async function load({ fetch }) {
    let config = await Config.loadUserConfig(fetch);

    if (localStorage.getItem(storagePrefix + 'config') === null) {
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
