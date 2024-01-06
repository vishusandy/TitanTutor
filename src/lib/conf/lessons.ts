import { StockWordList } from '$lib/lessons/base/stock_wordlist';
import { RandomChars } from '$lib/lessons/base/chars';
import type { StorableBaseLesson } from '$lib/lessons/lesson';
import { Series, revSeriesMap } from '$lib/lessons/series';

export const defaultStockLesson = 'en-test-words';


const qwerty_homerow: [string, number][] = [['a', 1 / 7], ['s', 1 / 7], ['d', 1 / 7], ['f', 1 / 7], ['j', 1 / 7], ['k', 1 / 7], ['l', 1 / 7]];
const qwerty_homerow_middle: [string, number][] = qwerty_homerow.map(([c, n]) => [c, n * 0.5]);
qwerty_homerow_middle.push(...[['g', 0.25] as [string, number], ['h', 0.25] as [string, number]]);


export const stockLessons: Map<string, StorableBaseLesson> = new Map([
    ['en-test-words', StockWordList.newStorable('en-test-words', 'test_words.json', 'Test Words')],

    ['dvorak_en-US_1', StockWordList.newStorable('dvorak_en-US_1', 'Dvorak homerow', 'dvorak_en-US/lesson_1_homerow_basic.json')],
    ['dvorak_en-US_2', StockWordList.newStorable('dvorak_en-US_2', 'Dvorak homerow + middle', 'dvorak_en-US/lesson_2_homerow_middle.json')],
    ['dvorak_en-US_3', StockWordList.newStorable('dvorak_en-US_3', 'Dvorak toprow', 'dvorak_en-US/lesson_3_toprow_basic.json')],
    ['dvorak_en-US_4', StockWordList.newStorable('dvorak_en-US_4', 'Dvorak toprow + middle', 'dvorak_en-US/lesson_4_toprow_middle.json')],
    ['dvorak_en-US_5', StockWordList.newStorable('dvorak_en-US_5', 'Dvorak bottomrow + middle', 'dvorak_en-US/lesson_5_bottomrow_basic.json')],
    ['dvorak_en-US_6', StockWordList.newStorable('dvorak_en-US_6', 'Dvorak bottomrow + middle', 'dvorak_en-US/lesson_6_bottomrow_middle.json')],

    ['colemak_en-US_1', StockWordList.newStorable('colemak_en-US_1', 'Colemak homerow', 'colemak_en-US/lesson_1_homerow_basic.json')],
    ['colemak_en-US_2', StockWordList.newStorable('colemak_en-US_2', 'Colemak homerow + middle', 'colemak_en-US/lesson_2_homerow_middle.json')],
    ['colemak_en-US_3', StockWordList.newStorable('colemak_en-US_3', 'Colemak toprow', 'colemak_en-US/lesson_3_toprow_basic.json')],
    ['colemak_en-US_4', StockWordList.newStorable('colemak_en-US_4', 'Colemak toprow + middle', 'colemak_en-US/lesson_4_toprow_middle.json')],
    ['colemak_en-US_5', StockWordList.newStorable('colemak_en-US_5', 'Colemak bottomrow + middle', 'colemak_en-US/lesson_5_bottomrow_basic.json')],
    ['colemak_en-US_6', StockWordList.newStorable('colemak_en-US_6', 'Colemak bottomrow + middle', 'colemak_en-US/lesson_6_bottomrow_middle.json')],

    ['qwerty_en-US_1', RandomChars.newStorable('qwerty_en-US_1', 'Qwerty homerow', qwerty_homerow) as StorableBaseLesson],
    ['qwerty_en-US_2', RandomChars.newStorable('qwerty_en-US_2', 'Qwerty homerow + middle', qwerty_homerow_middle) as StorableBaseLesson],
    ['qwerty_en-US_3', StockWordList.newStorable('qwerty_en-US_3', 'Qwerty toprow', 'qwerty_en-US/lesson_3_toprow_basic.json')],
    ['qwerty_en-US_4', StockWordList.newStorable('qwerty_en-US_4', 'Qwerty toprow + middle', 'qwerty_en-US/lesson_4_toprow_middle.json')],
    ['qwerty_en-US_5', StockWordList.newStorable('qwerty_en-US_5', 'Qwerty bottomrow + middle', 'qwerty_en-US/lesson_5_bottomrow_basic.json')],
    ['qwerty_en-US_6', StockWordList.newStorable('qwerty_en-US_6', 'Qwerty bottomrow + middle', 'qwerty_en-US/lesson_6_bottomrow_middle.json')],
]);

export const lessonPlans: Map<string, Series> = new Map([
    ['dvorak_en-US', new Series('dvorak_en-US', 'Dvorak', [
        'dvorak_en-US_1',
        'dvorak_en-US_2',
        'dvorak_en-US_3',
        'dvorak_en-US_4',
        'dvorak_en-US_5',
        'dvorak_en-US_6',
    ])],
    ['colemak_en-US', new Series('colemak_en-US', 'Colemak', [
        'colemak_en-US_1',
        'colemak_en-US_2',
        'colemak_en-US_3',
        'colemak_en-US_4',
        'colemak_en-US_5',
        'colemak_en-US_6',
    ])],
    ['qwerty_en-US', new Series('qwerty_en-US', 'Qwerty', [
        'qwerty_en-US_1',
        'qwerty_en-US_2',
        'qwerty_en-US_3',
        'qwerty_en-US_4',
        'qwerty_en-US_5',
        'qwerty_en-US_6',
    ])]
]);

export const lessonInSeries: Map<string, string> = revSeriesMap(lessonPlans);
