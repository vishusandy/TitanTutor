import { describe, expect, test } from 'vitest';
import { Language,  } from '$lib/data/language';
import {getPluralStrs, formatDuration} from '$lib/util/lang';

const lang = {
    "durationOneSecond":"%n second",
    "durationOtherSecond":"%n seconds",
    "durationOneMinute":"%n minute",
    "durationOtherMinute":"%n minutes",
    "durationOneHour":"%n hour",
    "durationOtherHour":"%n hours",
    "durationOneDay":"%n day",
    "durationOtherDay":"%n days"
};

const engPlurals = getPluralStrs(lang as Language);

describe('sum test', () => {
    test('0ms', () => expect(formatDuration(engPlurals, 0)).toBe('0 seconds')),
    test('1,000ms', () => expect(formatDuration(engPlurals, 1_000)).toBe('1 second')),
    test('2,000ms', () => expect(formatDuration(engPlurals, 2_000)).toBe('2 seconds')),
    test('60,000ms', () => expect(formatDuration(engPlurals, 60_000)).toBe('1 minute')),
    test('61,000ms', () => expect(formatDuration(engPlurals, 61_000)).toBe('1 minute, 1 second')),
    test('120,000ms', () => expect(formatDuration(engPlurals, 120_000)).toBe('2 minutes')),
    test('121,000ms', () => expect(formatDuration(engPlurals, 121_000)).toBe('2 minutes, 1 second')),
    test('3,600,000ms', () => expect(formatDuration(engPlurals, 3_600_000)).toBe('1 hour')),
    test('7,200,000ms', () => expect(formatDuration(engPlurals, 7_200_000)).toBe('2 hours')),
    test('86,400,000ms', () => expect(formatDuration(engPlurals, 86400000)).toBe('1 day'))
    test('172,800,000ms', () => expect(formatDuration(engPlurals, 172800000)).toBe('2 days'))
})
