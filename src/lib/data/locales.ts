import * as locales from '$lib/conf/locales';

export function defaultTtsLangs(locale: string): string[] {
    return recurseLocaleArray([locale, navigator.language, locales.fallbackLocale], locales.ttsDefaultsMap, locales.defaultTtsList);
}

export function interfaceLang(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, locales.fallbackLocale], locales.interfaceLanguagePaths, locales.defaultInterfaceLanguage);
}

export function defaultLessonName(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, locales.fallbackLocale], locales.defaultStockLessonLocaleMap, locales.defaultStockLesson);
}


function recurseLocaleArray<T, U>(locale: string[], map: Map<string, T>, fallback: T): T {
    if (locale.length === 0) return fallback;

    const d = map.get(locale[0]);
    if (d !== undefined) return d;

    const pos = locale[0].lastIndexOf('-');
    if (pos === -1) return recurseLocaleArray(locale.slice(1), map, fallback);

    locale[0] = locale[0].substring(0, pos);
    return recurseLocaleArray(locale, map, fallback);
}
