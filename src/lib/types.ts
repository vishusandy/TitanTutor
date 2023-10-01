import type { ComponentType, SvelteComponent } from 'svelte';

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

export type closeFn = ((data: any) => void);

export interface ComponentData extends SvelteComponent { data: any }

// todo: restrict to only components with a data property
export type innerDialogComponent = ComponentType<SvelteComponent>;


