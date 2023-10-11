export const prerender = true;
export const ssr = false;

import { loadUserLesson } from "$lib/lessons/lessons"
import { Config, storagePrefix } from "$lib/config";
import { createVoiceDialog } from '$lib/dialog';
import type { Audio } from '$lib/audio';

export async function load({ fetch }) {
    let config = await Config.loadUserConfig(fetch);
    let lesson = await loadUserLesson(config, fetch);
    
    if (localStorage.getItem(storagePrefix + 'config') === null) {
        await createVoiceDialog(config).then((audio?: Audio) => {
            if (audio !== undefined) {
                config.tts = audio;
                config.saveUserConfig();
            }
        });
    }

    return {
        config,
        lesson,
    };
}
