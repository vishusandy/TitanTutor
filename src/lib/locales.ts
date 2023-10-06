const defaultTtsList = ['English (America)', 'Google US English'];
export const ttsDefaultsMap: Map<string, string[]> = new Map([
    // locale   array of acceptable default languages
    ['en-US', ['English (America)', 'Google US English']],
]);


const defaultInterfaceLanguage: string = 'en-US';
export const interfaceLanguagePaths: Map<string, string> = new Map([
    // locale   dataFile (in static/data/lang/ without path or .json extension)
    ['en-US', 'en-US']
]);

const defaultLessonLocale: string = 'en-US';
export const defaultLessonData: [string, string] = ['en-test-words', 'test_words'];
export const lessonMap: Map<string, [string, string]> = new Map([
    // locale   lessonName      dataFile (in static/data/words, without the path or .json extension)
    ['en-US', ['en-test-words', 'test_words']]
]);




function recurseLocale<T>(locale: string, map: Map<string, T>, mapDefault: string, fallback: T): T {
    const d = map.get(locale);
    if (d !== undefined) return d;

    const pos = locale.lastIndexOf('-');
    if (pos === -1) return map.get(mapDefault) ?? fallback;

    return recurseLocale(locale.substring(0, pos), map, mapDefault, fallback)
}


export function getDefaultTtsLangsFromLocale(locale: string): string[] {
    return recurseLocale(locale, ttsDefaultsMap, navigator.language, defaultTtsList);
}

export function getUserInterfaceLang() {
    const lang = localStorage.getItem('language') ?? navigator.language;
    return recurseLocale(lang, interfaceLanguagePaths, navigator.language, defaultInterfaceLanguage);
}

export function getUserLessonName(): string {
    const lang = localStorage.getItem('lesson') ?? navigator.language;
    return recurseLocale(lang, lessonMap, navigator.language, defaultLessonData)[0];
}
