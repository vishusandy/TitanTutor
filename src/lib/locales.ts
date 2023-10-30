import { StockWordList } from "./lessons/base/wordlist";
import type { StorableBaseLesson } from "./lessons/lessons";

const fallbackLocale = 'en';

type LangItem = { name: string, path: string };
export const languageList: LangItem[] = [{ name: 'English - US', path: 'en-US' }];

export const defaultTtsList = ['English (America)', 'Google US English'];
export const ttsDefaultsMap: Map<string, string[]> = new Map([
    // locale   array of acceptable default languages for tts
    ['en-US', ['English (America)', 'Google US English']],
    ['en', ['English (America)', 'Google US English']],
]);

const exampleTextMap: Map<string, string> = new Map([
    ['English (America)', 'The boy was there when the sun rose.'],
    ['Google US English', 'The boy was there when the sun rose.'],
]);



const defaultInterfaceLanguage: string = 'en-US';
const interfaceLanguagePaths: Map<string, string> = new Map([
    // locale   dataFile (in static/data/lang/ without path or .json extension)
    ['en-US', 'en-US'],
    ['en', 'en-US'],
]);



const defaultStockLesson = 'en-test-words';
export const defaultStockLessonLocaleMap: Map<string, string> = new Map([
    // locale   stockLesson key
    ['en-US', 'en-test-words'],
    ['en', 'en-test-words'],
]);






export function defaultTtsLangs(locale: string): string[] {
    return recurseLocaleArray([locale, navigator.language, fallbackLocale], ttsDefaultsMap, defaultTtsList);
}

export function interfaceLang(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, fallbackLocale], interfaceLanguagePaths, defaultInterfaceLanguage);
}

export function defaultLessonName(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, fallbackLocale], defaultStockLessonLocaleMap, defaultStockLesson);
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
