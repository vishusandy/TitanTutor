
import type { Mapping } from "./mappings";
import { NoMap } from "./mappings/no_map";
import { QwertyToDvorak } from "./mappings/qwerty_to_dvorak";
import { en_US } from "./translations/english";
import type { Translations } from "./translations";
import type { Lesson } from "./lessons/lessons";

// Create a new shuffled array
// Modified from: https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
export function shuffle(input: string[]): string[] {
    let array = [...input];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export function defaultBatch(lesson: Lesson, n: number) {
    let words: string[] = [];

    let word: string, iter = lesson.next(), i = 0;
    while (i < n && iter.done !== true && (word = iter.value)) {
        words.push(word);
        iter = lesson.next();
        i += 1;
    }

    return words;
}

const map: Map<string, string[]> = new Map([
    ['en-US', ['English (America)']],
]);

const langMap: Map<string, Translations> = new Map([
    ['en-US', en_US]
]);

export function mapLocale(locale: string): string[] {
    return map.get(locale) ?? ['English (America)'];
}

export function mapLanguage(locale: string): Translations {
    return langMap.get(locale) ?? en_US;
}


export function deserializeMapping(mapping: string): Mapping {
    switch (mapping) {
        case QwertyToDvorak.mapName: return new QwertyToDvorak();
        case NoMap.mapName:
        default:
            return new NoMap();
    }
}
