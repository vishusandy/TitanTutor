import type { Language } from "./language";
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

// modified slightly (for multilingual support) from:
// https://www.30secondsofcode.org/js/s/format-duration/
export const formatDuration = (ms: number, lang: Language) => {
    if (ms < 0) ms = -ms;
    const time = {
        day: Math.floor(ms / 86400000),
        hour: Math.floor(ms / 3600000) % 24,
        minute: Math.floor(ms / 60000) % 60,
        second: Math.floor(ms / 1000) % 60,
    };
    return Object.entries(time)
        .filter(val => val[1] !== 0 || val[0] == 'second')
        .map(([key, val]) => `${val} ` + (val !== 1 ? lang[key + 's'] : lang[key]))
        .join(', ');
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
