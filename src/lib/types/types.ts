import type { ComponentType, SvelteComponent } from 'svelte';

export const enum CheckMode {
    Char = 0,
    WordRepeat = 1, // redo current word if wrong
}

// // ignores or accepts backspace
// export const enum BackspaceMode {
//     Accept = 0,
//     Ignore = 1,
// }

export const enum Action {
    None = 0,
    Refresh = 1,
    WordReset = 2, // for word mode
    CharAdded = 4,
    NextWord = 8,
    LessonCompleted = 16,
    MissedSpace = 32, // for char mode when optionalSpace==false
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

