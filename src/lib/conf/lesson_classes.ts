/**
 * All available base classes and wrapper classes need to be listed here.
 * 
 * @module
 */

import { StockWordList } from '../lessons/base/stock_wordlist';
import { RandomList } from '../lessons/wrappers/random';
import { UntilN } from '../lessons/wrappers/until_n';
import type { Config } from '$lib/config';
import { UserWordList } from '../lessons/base/user_wordlist';
import { AdaptiveList } from '../lessons/base/adaptive_list';
import { RandomChars } from '../lessons/base/chars';
import type { LessonFormState } from '$lib/types/forms';
import type { Lesson } from '$lib/lessons/lesson';
import { adaptive_typeid, chars_typeid, random_typeid, until_typeid, userwordlist_typeid, wordlist_typeid } from '$lib/conf/lesson_ids';
import {
    LessonClass,
    WrapperClass
} from '$lib/lessons/lesson_class';


export const classes = [
    new LessonClass(wordlist_typeid, (lang) => lang.classStockWords, StockWordList.fromStorable),
    new LessonClass(userwordlist_typeid, (lang) => lang.classUserWords, UserWordList.fromStorable),
    new LessonClass(chars_typeid, (lang) => lang.classRandomChars, RandomChars.fromStorable),
    new WrapperClass(adaptive_typeid, (lang) => lang.classAdaptive, AdaptiveList.fromStorable, AdaptiveList.fromForm,),
    new WrapperClass(random_typeid, (lang) => lang.classRandomize, RandomList.fromStorable, RandomList.fromForm,),
    new WrapperClass(until_typeid, (lang) => lang.classUntil, UntilN.fromStorable, UntilN.fromForm,),
];

