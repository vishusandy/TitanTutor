import type { ComponentType, SvelteComponent } from 'svelte';

/**
 * Specifies how end-of-word errors and spaces are handled.
 */
export const enum CheckMode {
    Char = 0,
    WordRepeat = 1, // redo current word if wrong
}

/**
 * Indicates what actions were/should be taken.
 * 
 * Each value is specified as a bit field to allow multiple actions to be specified in a sinlge number.
 */
export const enum Action {
    None = 0,
    Refresh = 1 << 0,
    WordReset = 1 << 1, // for word mode
    CharAdded = 1 << 2,
    NextWord = 1 << 3,
    LessonCompleted = 1 << 4,
    MissedSpace = 1 << 5, // for char mode when optionalSpace==false
}

/**
 * Defines the states a letter can be shown as.
 */
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

/**
 * Specifies the type definition of a callback function that is called when a form dialog is closed.
 */
export type CloseFn<T> = ((data: T | undefined) => void);

/**
 * Specifies a svelte component type used when passing a {@link SvelteComponent} to dialog functions to indicate which component should be rendered in the dialog box.
 */
export type InnerDialogComponent = ComponentType<SvelteComponent>;

