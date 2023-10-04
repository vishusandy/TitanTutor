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

export type closeFn<T> = ((data: T | undefined) => void);

export interface ComponentData extends SvelteComponent { formData: any }

export type innerDialogComponent<T> = ComponentType<SvelteComponent<{ formData?: T }>>;

