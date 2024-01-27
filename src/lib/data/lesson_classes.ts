import { StockWordList } from '../lessons/base/stock_wordlist';
import { RandomList } from '../lessons/wrappers/random';
import { UntilN } from '../lessons/wrappers/until_n';
import type { Config } from '$lib/types/config';
import { UserWordList } from '../lessons/base/user_wordlist';
import { AdaptiveList } from '../lessons/base/adaptive_list';
import { RandomChars } from '../lessons/base/chars';
import type { LessonFormState } from '$lib/types/forms';
import type { Lesson } from '$lib/lessons/lesson';


export const baseClasses = [
    StockWordList,
    UserWordList,
    RandomChars,
];

export const wrapperClasses = [
    AdaptiveList,
    RandomList,
    UntilN,
];

const wrapperBuilders: ((lesson: Lesson, config: Config, db: IDBDatabase, form: LessonFormState) => Promise<Lesson>)[] = [
    AdaptiveList.fromForm,
    RandomList.fromForm,
    UntilN.fromForm,
];

export async function addWrappers(base: Lesson, config: Config, db: IDBDatabase, state: LessonFormState): Promise<Lesson> {
    let lesson = base;
    for (let i = 0; i < wrapperBuilders.length; i++) {
        lesson = await wrapperBuilders[i](lesson, config, db, state);
        // console.log(`after wrapper ${wrapperClasses[i].getTypeId()}:`, lesson.getType(), 'storable:', lesson.storable());
    }
    return lesson;
}
