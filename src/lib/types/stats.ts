export type StatsEntry = {
    duration: number,
    keystrokes: number,
    wordErrors: number,
    backspaces: number,
    words: number,
    chars: number,
    uncorrectedErrors: number,
    correctedErrors: number,
};

export type AccumStats = { [K in keyof StatsEntry]: [number, number] } & { count: number };
export type StatsArray = [keyof StatsEntry, number, number][];
