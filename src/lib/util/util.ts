import type { Language } from "../data/language";
import type { Lesson } from "../lessons/lesson";

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

export function uniqueChars(arr: string[]): Set<string> {
    let set: Set<string> = new Set();
    arr.forEach(w => [...w].forEach(c => set.add(c)));
    return set;
}
