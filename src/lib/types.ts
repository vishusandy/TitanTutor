import type { ComponentType, SvelteComponent } from 'svelte';

export const enum Action {
    None = 0,
    Refresh = 1,
    NextWord = 2,
    LessonCompleted = 3,
}

export const enum LetterState {
    Incomplete = 0,
    Active = 1,
    Complete = 2,
    Error = 3,
}

export function letterStateString(letter: LetterState): string {
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

export type closeFn<T> = ((data: T | undefined) => void);

export type innerDialogComponent = ComponentType<SvelteComponent>;

