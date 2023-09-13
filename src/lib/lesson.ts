
import type { Session } from "./session";
import type { Config } from "./config";

export interface Lesson extends Iterator<string>, Iterable<string> {
    completed: string[];
    batch(n: number): string[];
}


export class PregenLesson implements Lesson {
    completed: string[] = [];
    words: string[];

    constructor(words: string[]) {
        let word = words.shift();
        if (word === undefined) {
            throw new Error("Invalid word list: must contain at least one element");
        }
        this.words = words;
    }

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<string> {
        let word = this.words.shift();

        if (word === undefined) {
            return { done: true, value: undefined };
        }

        return { done: false, value: word }
    }

    batch(n: number): string[] {
        let words: string[] = []
        for (let i = 0; i < n; i++) {
            let word = this.words.shift();

            if (word === undefined) {
                return words;
            }

            words.push(word)
        }

        return words;
    }
};

export const pregen_test = new PregenLesson([
    'account',
    'attention',
    'amount',
    'animal',
    'answer',
    'approval',
    'argument',
    'attempt',
    'authority',
    'behavior',
    'belief',
    'breath',
    'building',
    'business',
    'butter',
    'canvas',
    'change',
    'color',
    'comfort',
    'committee',
    'comparison',
    'competition',
    'connection',
    'control',
    'cough',
    'current',
    'damage',
    'daughter',
    'decision',
    'development',
    'digestion',
    'discussion',
    'disease',
    'disgust',
    'distribution',
    'division',
    'driving',
    'education',
    'error',
    'event',
    'example',
    'existence',
    'expansion',
    'fiction',
    'field',
    'flame',
    'flight',
    'friend',
    'front',
    'fruit',
]);

// export type OnDemandFunc = (session: Session) => string[] | null;
// interface LessonOnDemand extends Lesson {
//     cur: string;
//     gen: OnDemandFunc;
// }
