/**
 * Assosciate lessons, interface languages, and text-to-speech languages with 
 * various locales.
 * 
 * @module
 */


/**
 * Used when other preferred matching options fail.
 * 
 * This locale **must** exist in the category it is being matched in.
 */
export const fallbackLocale = 'en';

/**
 * List of interface languages the user can choose from.
 */
export const languageList: { name: string, path: string }[] = [{ name: 'English - US', path: 'en-US' }];

/**
 * List of Text-to-speech items to match as a last attempt when no matching items are found for the user's language.
 * 
 * Google Chrome uses `'Google US English'` instead of the more common `'English (America)'`.
 */
export const defaultTtsList = ['English (America)', 'Google US English'];

/** A last resort fallback value if no other suitable interface language can be found. */
export const defaultInterfaceLanguage: string = 'en-US';

/**
 * A Map with the available default text-to-speech options.
 * 
 * The keys are locales and the values are arrays containing the names of the
 * browser's text-to-speech languages to match to the specified locale.
 */
export const ttsDefaultsMap: Map<string, string[]> = new Map([
    ['en-US', ['English (America)', 'Google US English']],
    ['en', ['English (America)', 'Google US English']],
]);

// TODO: unused
export const exampleTextMap: Map<string, string> = new Map([
    ['English (America)', 'The boy was there when the sun rose.'],
    ['Google US English', 'The boy was there when the sun rose.'],
]);


/** 
 * Maps interface languages to json files in the `static/data/lang/` folder.
 * 
 * The Map's keys are the interface language and the values are the filename
 * without the .json extension.
 */
export const interfaceLanguagePaths: Map<string, string> = new Map([
    // locale   dataFile (in static/data/lang/ without path or .json extension)
    ['en-US', 'en-US'],
    ['en', 'en-US'],
]);

/**
 * Maps the user's locale to default lessons.
 * 
 * The Map's keys are the locale and values are the lesson ID.
 */
export const defaultStockLessonLocaleMap: Map<string, string> = new Map([
    // ['en-US', 'qwerty_en-US_1'],
    ['en', 'dvorak_en-US_1'],
]);
