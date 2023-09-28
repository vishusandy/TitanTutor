import type { Lesson } from "./lesson";
import type { Config } from "./config";
import type { Stats } from "./stats";

export type Session = {
    config: Config;
    lesson: Lesson;
    stats: Stats;
}

