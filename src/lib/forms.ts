import type { BackspaceMode, CheckMode } from "./config";

export type UserValue<T> = T | 'user';
export type UserOptional<T> = T | null | 'user';

export type FormUserValue<T> = UserValue<T> | 'disabled';
export type FormUserOptional<T> = UserOptional<T> | 'disabled';

// export type LessonCheckboxState = FormUserValue<boolean>;
// export type FormUserOptional<number> = FormUserOptional<number>;


export type LessonFormState = {
    checkMode: FormUserValue<CheckMode>,
    backspace: FormUserValue<BackspaceMode>,
    wordBatchSize: FormUserValue<number>,
    minQueue: FormUserValue<number>,
    random: FormUserValue<boolean>;
    until: FormUserOptional<number>;
};

export const defaultLessonFormState: LessonFormState = {
    random: 'user',
    until: 'user',
    checkMode: 'user',
    backspace: 'user',
    wordBatchSize: 'user',
    minQueue: 'user',
};


function nextCheckboxState(state: FormUserValue<boolean>): FormUserValue<boolean> {
    switch (state) {
        case true:
            return false;
        case false:
            return true;
        case 'user':
            return true;
        case 'disabled':
            return 'disabled';
    }
}

