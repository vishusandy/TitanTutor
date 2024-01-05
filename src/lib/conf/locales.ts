export const fallbackLocale = 'en';

export type LangItem = { name: string, path: string };
export const languageList: LangItem[] = [{ name: 'English - US', path: 'en-US' }];

export const defaultTtsList = ['English (America)', 'Google US English'];
export const defaultInterfaceLanguage: string = 'en-US';
export const defaultStockLesson = 'en-test-words';

export const ttsDefaultsMap: Map<string, string[]> = new Map([
    // locale   array of acceptable default languages for tts
    ['en-US', ['English (America)', 'Google US English']],
    ['en', ['English (America)', 'Google US English']],
]);

export const exampleTextMap: Map<string, string> = new Map([
    ['English (America)', 'The boy was there when the sun rose.'],
    ['Google US English', 'The boy was there when the sun rose.'],
]);

export const interfaceLanguagePaths: Map<string, string> = new Map([
    // locale   dataFile (in static/data/lang/ without path or .json extension)
    ['en-US', 'en-US'],
    ['en', 'en-US'],
]);

export const defaultStockLessonLocaleMap: Map<string, string> = new Map([
    // locale   stockLesson key
    ['en-US', 'dvorak_en-US_1'],
    ['en', 'dvorak_en-US_1'],
    // ['en', 'en-test-words'],
]);
