
export class Series {
    id: string;
    name: string;
    lessons: string[]

    constructor(id: string, name: string, lessons: string[]) {
        this.id = id;
        this.name = name;
        this.lessons = lessons;
    }

    lessonPos(lesson: string): number | null {
        const pos = this.lessons.findIndex((val) => val === lesson);
        if (pos === -1) return null;
        return pos;
    }

    prev(lesson: string): string | null {
        const pos = this.lessons.findIndex((val) => val === lesson);
        return (pos > 0) ? this.lessons[pos - 1] : null;
    }

    next(lesson: string): string | null {
        const pos = this.lessons.findIndex((val) => val === lesson);
        return (pos !== -1 && pos < this.lessons.length - 1) ? this.lessons[pos + 1] : null;
    }
}

export function revSeriesMap(lessonPlans: Map<string, Series>): Map<string, string> {
    const map: Map<string, string> = new Map();
    lessonPlans.forEach((series, plan) => {
        for (const lesson of series.lessons) {
            const existing = map.get(lesson);
            if (existing === undefined) {
                map.set(lesson, plan)
            } else {
                console.warn(`Series '${plan}' and '${existing}' both have the same lesson '${lesson}'`)
            }
        }
    });

    return map;
}





