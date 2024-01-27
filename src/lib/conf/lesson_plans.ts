import { Series, revSeriesMap } from '$lib/lessons/series';

export const lessonPlans: Map<string, Series> = new Map([
    ['dvorak_en-US', new Series('dvorak_en-US', 'Dvorak', /^en\W/, [
        'dvorak_en-US_1',
        'dvorak_en-US_2',
        'dvorak_en-US_3',
        'dvorak_en-US_4',
        'dvorak_en-US_5',
        'dvorak_en-US_6',
    ])],
    ['colemak_en-US', new Series('colemak_en-US', 'Colemak', /^en\W/, [
        'colemak_en-US_1',
        'colemak_en-US_2',
        'colemak_en-US_3',
        'colemak_en-US_4',
        'colemak_en-US_5',
        'colemak_en-US_6',
    ])],
    ['qwerty_en-US', new Series('qwerty_en-US', 'Qwerty', /^en\W/, [
        'qwerty_en-US_1',
        'qwerty_en-US_2',
        'qwerty_en-US_3',
        'qwerty_en-US_4',
        'qwerty_en-US_5',
        'qwerty_en-US_6',
    ])]
]);

export const lessonInSeries: Map<string, string> = revSeriesMap(lessonPlans);
