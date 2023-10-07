import { storagePrefix } from "./config";

export const defaultTtsList = ['English (America)', 'Google US English'];
export const ttsDefaultsMap: Map<string, string[]> = new Map([
    // locale   array of acceptable default languages for tts
    ['en-US', ['English (America)', 'Google US English']],
    ['en', ['English (America)', 'Google US English']],
]);


const defaultInterfaceLanguage: string = 'en-US';
const interfaceLanguagePaths: Map<string, string> = new Map([
    // locale   dataFile (in static/data/lang/ without path or .json extension)
    ['en-US', 'en-US'],
    ['en', 'en-US'],
]);

export const defaultLessonData: [string, string] = ['en-test-words', 'test_words'];
export const lessonMap: Map<string, [string, string]> = new Map([
    // locale   lessonName      dataFile (in static/data/words, without the path or .json extension)
    ['en-US', ['en-test-words', 'test_words']],
    ['en', ['en-test-words', 'test_words']],
]);

const exampleTextMap: Map<string, string> = new Map([
    ['en', 'The boy was there when the sun rose.'],
]);


export function recurseLocale<T>(locale: string, map: Map<string, T>, mapDefault: string, fallback: T): T {
    const d = map.get(locale);
    if (d !== undefined) return d;

    const pos = locale.lastIndexOf('-');
    if (pos === -1) return map.get(mapDefault) ?? fallback;

    return recurseLocale(locale.substring(0, pos), map, mapDefault, fallback)
}

export function recurseLocaleArray<T, U>(locale: string[], map: Map<string, T>, fallback: U): T | U {
    if (locale.length === 0) return fallback;

    const d = map.get(locale[0]);
    if (d !== undefined) return d;

    const pos = locale[0].lastIndexOf('-');
    if (pos === -1) return recurseLocaleArray(locale.slice(1), map, fallback);

    locale[0] = locale[0].substring(0, pos);
    return recurseLocaleArray(locale, map, fallback);
}

export function getDefaultTtsLangsFromLocale(locale: string): string[] {
    return recurseLocale(locale, ttsDefaultsMap, navigator.language, defaultTtsList);
}

export function getInterfaceLangFromLocale(locale: string): string {
    return recurseLocale(locale, interfaceLanguagePaths, navigator.language, defaultInterfaceLanguage);
}

export function getUserLessonName(): string {
    const lang = localStorage.getItem(storagePrefix + 'lesson') ?? navigator.language;
    return recurseLocale(lang, lessonMap, navigator.language, defaultLessonData)[0];
}
