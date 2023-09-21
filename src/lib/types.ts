
export const enum Action {
    None = 0,
    Refresh = 1,
    lessonCompleted = 2,
}

export const enum LetterState {
    Incomplete = 0,
    Active = 1,
    Complete = 2,
    Error = 3,
}

export type WordState = {
    word: string;
    state: LetterState[];
    input: string;
}

