import { StockWordList } from '$lib/lessons/base/stock_wordlist';
import type { StorableBaseLesson } from '$lib/lessons/lesson';


export const stockLessons: Map<string, StorableBaseLesson> = new Map([
    ['en-test-words', StockWordList.newStorable('en-test-words', 'test_words.json', 'Test Words')],
    ['dvorak_en-US_1', StockWordList.newStorable('dvorak_en-US_1', 'dvorak_en-US/lesson_1_homerow_basic.json', 'Dvorak homerow')],
    ['dvorak_en-US_2', StockWordList.newStorable('dvorak_en-US_2', 'dvorak_en-US/lesson_2_homerow_basic.json', 'Dvorak homerow + widdle')],
    ['dvorak_en-US_3', StockWordList.newStorable('dvorak_en-US_3', 'dvorak_en-US/lesson_3_homerow_basic.json', 'Dvorak toprow')],
    ['dvorak_en-US_4', StockWordList.newStorable('dvorak_en-US_4', 'dvorak_en-US/lesson_4_homerow_basic.json', 'Dvorak toprow + middle')],
    ['dvorak_en-US_5', StockWordList.newStorable('dvorak_en-US_5', 'dvorak_en-US/lesson_5_homerow_basic.json', 'Dvorak bottomrow + middle')],
    ['dvorak_en-US_6', StockWordList.newStorable('dvorak_en-US_6', 'dvorak_en-US/lesson_6_homerow_basic.json', 'Dvorak bottomrow + middle')],
]);
