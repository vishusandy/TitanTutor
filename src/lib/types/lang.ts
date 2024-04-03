
export type Plurals = {
    one: string,
    other: string,
};

export interface Dur {
    day: number,
    hour: number,
    minute: number,
    second: number,
};

export interface PluralStrs {
    [key: string]: Plurals;
    day: Plurals,
    hour: Plurals,
    minute: Plurals,
    second: Plurals,
};
