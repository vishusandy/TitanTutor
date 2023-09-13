import type { Lesson } from "./lesson";
import type { Config } from "./config";

export type Session = {
    started: Date;
    config: Config;
    lesson: Lesson;
}

