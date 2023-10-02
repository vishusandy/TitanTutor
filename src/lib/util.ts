
import type { Mapping } from "./mappings";
import { NoMap } from "./mappings/no_map";
import { QwertyToDvorak } from "./mappings/qwerty_to_dvorak";

// https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
export function shuffle(input: string[]) {
    let array = [...input];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


export function mapLocale(locale: string): string[] {
    const map: Map<string, string[]> = new Map([
        ['en-US', ['English (America)']],
    ]);

    return map.get(locale) ?? ['English (America)'];
}

export function deserializeMapping(mapping: string): Mapping {
    switch (mapping) {
        case QwertyToDvorak.mapName: return new QwertyToDvorak();
        case NoMap.mapName:
        default:
            return new NoMap();
    }
}
