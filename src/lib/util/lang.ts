import { Language } from "$lib/data/language";
import {type Dur, type PluralStrs} from '$lib/types/lang';
import type { StatsEntry } from '$lib/types/stats';

export function getPluralStrs(lang: Language, short: boolean = false): PluralStrs {
    if (short) {
        return {
            day: {one: lang.durationShortOneDay, other: lang.durationShortOtherDay},
            hour: {one: lang.durationShortOneHour, other: lang.durationShortOtherHour},
            minute: {one: lang.durationShortOneMinute, other: lang.durationShortOtherMinute},
            second: {one: lang.durationShortOneSecond, other: lang.durationShortOtherSecond},
        };
    }
    
    return {
        day: {one: lang.durationOneDay, other: lang.durationOtherDay},
        hour: {one: lang.durationOneHour, other: lang.durationOtherHour},
        minute: {one: lang.durationOneMinute, other: lang.durationOtherMinute},
        second: {one: lang.durationOneSecond, other: lang.durationOtherSecond},
    };
}

export function translateStatsKey(lang: Language, key: keyof StatsEntry): string {
    switch(key) {
        case "duration": return lang.statsDialogDuration;
        case "keystrokes": return lang.statsDialogKeystrokes;
        case "words": return lang.statsDialogWords;
        case "chars": return lang.statsDialogChars;
        case "uncorrectedErrors": return lang.statsDialogUncorrectedErrors;
        case "correctedErrors": return lang.statsDialogCorrectedErrors;
        case "wordErrors": return lang.statsLogBackspaces;
        case "backspaces": return lang.statsLogWordErrors;
    }
    return '';
}

// Pluralization:
//   https://lingohub.com/blog/pluralization
//   https://www.unicode.org/cldr/charts/44/supplemental/language_plural_rules.html
export function pluralizeDur(plurals: PluralStrs, durs: Dur, sep: string): string {
    const empty = [durs.day, durs.hour, durs.minute].find((n) => n !== 0) === undefined;
    const pluralize = (k: keyof Dur, v: number) => v === 1? plurals[k].one: plurals[k].other;
    const isEmpty = (k: string, v: number) => v !== 0 || (k === 'second' && empty);
    
    return Object.entries(durs)
        .filter((e: [string, number]) => isEmpty(...e))
        .map(([k,v]) => pluralize(k as keyof Dur, v).replace('%n', v.toString()))
        .join(sep)
}

// Modified (for multilingual support) from:
//   https://www.30secondsofcode.org/js/s/format-duration/
export function getDuration(ms: number): Dur {
    if (ms < 0) ms = -ms;
    return {
        day: Math.floor(ms / 86_400_000),
        hour: Math.floor(ms / 3_600_000) % 24,
        minute: Math.floor(ms / 60_000) % 60,
        second: Math.floor(ms / 1_000) % 60,
    };
}

export const formatDuration = (plurals: PluralStrs, ms: number, sep: string = ', ') => {
    return pluralizeDur(plurals, getDuration(ms), sep);
};


