/**
 * Functions for finding a suitable locale for a user based on their user settings and the language specified by their browser.
 * 
 * @module
 */


import * as locales from '$lib/conf/locales';
import { fallbackStockLesson } from '$lib/conf/lessons';


export function defaultTtsLangs(locale: string): string[] {
    return recurseLocaleArray([locale, navigator.language, locales.fallbackLocale], locales.ttsDefaultsMap, locales.defaultTtsList);
}

export function interfaceLang(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, locales.fallbackLocale], locales.interfaceLanguagePaths, locales.defaultInterfaceLanguage);
}

export function defaultLessonName(locale: string): string {
    return recurseLocaleArray([locale, navigator.language, locales.fallbackLocale], locales.defaultStockLessonLocaleMap, fallbackStockLesson);
}

/**
 * Recursively look for the closest matching language according to the format described in {@link https://datatracker.ietf.org/doc/html/rfc5646 | RFC5646 }.
 * 
 * @param {string[]} locale - a list of suitable locale options
 * @param {Map<string, T>} map - the locales that are available
 * @param fallback - used if no matching options from `locale` were found
 * @returns returns the assosciated value form `map`
 */
function recurseLocaleArray<T, U>(locale: string[], map: Map<string, T>, fallback: T): T {
    // all elements of `locale` have been iterated, return the fallback value
    if (locale.length === 0) return fallback;

    // check for a match
    const d = map.get(locale[0]);
    if (d !== undefined) return d;

    // make the current `locale` value less specific
    const pos = locale[0].lastIndexOf('-');

    // cannot make the current element of `locale` less specific, so begin searching the next element of `locale`
    if (pos === -1) return recurseLocaleArray(locale.slice(1), map, fallback);

    // retry the search with a less specific locale
    locale[0] = locale[0].substring(0, pos);
    return recurseLocaleArray(locale, map, fallback);
}
