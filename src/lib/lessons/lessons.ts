import { base } from '$app/paths';
import { BaseLesson } from './base';
import { RandomList } from './wrappers/random';
import { UntilN } from './wrappers/until_n';
import { LessonOptions } from './options';
import { lessonMap, defaultLessonData, getUserLessonName } from '$lib/locales';

export interface Lesson extends Iterator<string>, Iterable<string> {
    batch(n: number): string[];
}

export class LessonData {
    lessonName: string = '';
    path: string;
    prevLesson?: string;
    nextLesson?: string;

    constructor(lessonName: string, path: string, prevLesson?: string, nextLesson?: string) {
        this.lessonName = lessonName;
        this.path = path;
        this.nextLesson = nextLesson;
        this.prevLesson = prevLesson;
    }

    static async loadUserLesson(fetchFn: typeof fetch): Promise<[Lesson, LessonOptions]> {
        const userLesson = getUserLessonName();
        const lessonData = lessons.get(userLesson) ?? new LessonData(...defaultLessonData);

        return lessonData.loadLesson(fetchFn);
    }

    async loadLesson(fetchFn: typeof fetch): Promise<[Lesson, LessonOptions]> {
        const req = new Request(`${base}/data/words/${this.path}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((words: string[]) => {
                const opts = LessonOptions.loadOptions(this.lessonName);

                let lesson: Lesson = (opts.random) ? new RandomList(words) : new BaseLesson(words);

                if (opts.until !== undefined) {
                    lesson = new UntilN(lesson, opts.until);
                }

                return [lesson, opts];
            });
    }
}

const lessons: Map<string, LessonData> = new Map((() => {
    let arr: [string, LessonData][] = []
    for (let [_, val] of lessonMap) {
        arr.push([val[0], new LessonData(val[0], val[1])])
    }
    return arr;
})());

