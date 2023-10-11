import { storagePrefix } from "./config";

const fallbackLocale = 'en';

export const defaultTtsList = ['English (America)', 'Google US English'];
export const ttsDefaultsMap: Map<string, string[]> = new Map([
    // locale   array of acceptable default languages for tts
    ['en-US', ['English (America)', 'Google US English']],
    ['en', ['English (America)', 'Google US English']],
]);

const exampleTextMap: Map<string, string> = new Map([
    ['en', 'The boy was there when the sun rose.'],
]);



const defaultInterfaceLanguage: string = 'en-US';
const interfaceLanguagePaths: Map<string, string> = new Map([
    // locale   dataFile (in static/data/lang/ without path or .json extension)
    ['en-US', 'en-US'],
    ['en', 'en-US'],
]);



export const defaultLessonData: [string, string] = ['en-test-words', 'test_words'];
export const lessonDefaultDataLocaleMap: Map<string, [string, string]> = new Map([
    // locale   lessonName      dataFile (in static/data/words, without the path or .json extension)
    ['en-US', ['en-test-words', 'test_words']],
    ['en', ['en-test-words', 'test_words']],
]);

const defaultStockLesson = 'en-test-words';

export const defaultStockLessonLocaleMap: Map<string, string> = new Map([
    ['en-US', 'en-test-words'],
]);

export const stockLessonPaths: Map<string, string> = new Map([
    ['en-test-words', 'test_words'],
]);





function recurseLocaleArray<T, U>(locale: string[], map: Map<string, T>, fallback: U): T | U {
    if (locale.length === 0) return fallback;

    const d = map.get(locale[0]);
    if (d !== undefined) return d;

    const pos = locale[0].lastIndexOf('-');
    if (pos === -1) return recurseLocaleArray(locale.slice(1), map, fallback);

    locale[0] = locale[0].substring(0, pos);
    return recurseLocaleArray(locale, map, fallback);
}

export function getDefaultTtsLangsFromLocale(locale: string): string[] {
    return recurseLocaleArray([locale, navigator.language, fallbackLocale], ttsDefaultsMap, defaultTtsList);
}

export function getInterfaceLangFromLocale(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, fallbackLocale], interfaceLanguagePaths, defaultInterfaceLanguage);
}

export function getDefaultLessonFromLocale(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, fallbackLocale], defaultStockLessonLocaleMap, defaultStockLesson);
}

export function getUserLessonName(): string {
    const lang = localStorage.getItem(storagePrefix + 'lesson') ?? navigator.language;
    return recurseLocaleArray([lang, navigator.language, fallbackLocale], lessonDefaultDataLocaleMap, defaultLessonData)[0];
}
