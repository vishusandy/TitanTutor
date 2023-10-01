
// todo: unused
export const enum DurationType {
    NumWords = 0,
    Time = 1,
    UntilError = 2,
}

// todo: unused
export type Duration = {
    length: number;
    type: DurationType;
}

export interface Lesson extends Iterator<string>, Iterable<string> {
    completed: string[];
    batch(n: number): string[];
}


export type PregenListConfig = {
    shuffle: boolean;
    length: number;
};

export class PregenList implements Lesson {
    completed: string[] = [];
    words: string[];

    constructor(words: string[]) {
        if (words.length === 0) {
            throw new Error("Invalid pregenerated word list: the list must contain at least one element");
        }

        // if()

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
        let word: string | undefined;
        let i: number = 0;
        while (i < n && (word = this.words.shift())) {
            words.push(word)
            i += 1;
        }

        return words;
    }
};

export const pregen_test = new PregenList([
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
