import { defaultMap } from '$lib/conf/kbmaps';
import { configDefaultValues } from "$lib/conf/config";
import type { ConfigStorable } from '$lib/types/config';
import { defaultTtsLangs, interfaceLang } from './locales';
import { UserStats } from '$lib/stats';




export function defaultStorable(): ConfigStorable {
    return {
        ...configDefaultValues,
        tts: '',
        remap: defaultMap,
        audioDefaults: defaultTtsLangs(navigator.language),
        lang: interfaceLang(navigator.language),
        userStats: new UserStats(),
    };
}
