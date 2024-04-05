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

/**
 * Entries are in format: `[total, average]`
 */
export type AccumStats = { [K in keyof StatsEntry]: [number, number] } & { count: number };
/**
 * Uses the format: `[StatsEntry, total, average]`
 */
export type StatsArray = [keyof StatsEntry, number, number][];
