import type { Lesson } from "./lesson";
import type { Config } from "./config";

export type Session = {
    started: Date | undefined;
    dur: number;
    config: Config;
    lesson: Lesson;
}

