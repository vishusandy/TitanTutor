import type { ComponentType, SvelteComponent } from 'svelte';

export const enum Action {
    None = 0,
    Refresh = 1,
    NextWord = 2,
    LessonCompleted = 3,
    MissedSpace = 4, // for char mode when optionalSpace==false
    WordReset = 5, // for word mode
    CharAdded = 6,

}

export const enum LetterState {
    Incomplete = 0,
    Active = 1,
    Complete = 2,
    Error = 3,
}

export function letterStateToString(letter: LetterState): string {
    switch (letter) {
        case LetterState.Incomplete:
            return "incomplete"
        case LetterState.Active:
            return "active"
        case LetterState.Complete:
            return "complete"
        case LetterState.Error:
            return "error"
        default:
            return "";
    }
}

export type CloseFn<T> = ((data: T | undefined) => void);

export type InnerDialogComponent = ComponentType<SvelteComponent>;

