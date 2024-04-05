import type { StatsLog } from "$lib/stats";
import type { StatsEntry } from "$lib/types/stats";
import { type AccumStats, type StatsArray } from "$lib/types/stats";

export const defaultStats: StatsEntry = {
    duration: 0,
    keystrokes: 0,
    wordErrors: 0,
    backspaces: 0,
    words: 0,
    chars: 0,
    uncorrectedErrors: 0,
    correctedErrors: 0,
};

export function calcAverages(stats: StatsLog): AccumStats {
    let k: keyof StatsEntry;

    const s: AccumStats = { count: 0 } as AccumStats;
    for (k in defaultStats) {
        s[k] = [0, 0];
    }

    stats.entries.reduce((acc, e) => {
        acc.count += 1;
        for (k in e) {
            acc[k][0] += e[k];
        }
        return acc;
    }, s);

    const count = s.count;
    for (k in defaultStats) {
        s[k][1] = s[k][0] / count;
    }

    return s;
}

export function toStatsArray(a: AccumStats): StatsArray {
    let arr: StatsArray = [];
    let k: keyof AccumStats;
    for (k in a) {
        if (k !== 'count') {
            arr.push([k, a[k][0], a[k][1]]);
        }
    }
    return arr;
}
