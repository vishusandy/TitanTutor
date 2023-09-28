import type { Lesson } from "./lesson";
import type { Config } from "./config";
import type { Stats } from "./stats";

export type Session = {
    started: Date | undefined;
    dur: number;
    config: Config;
    lesson: Lesson;
    stats: Stats;
}

