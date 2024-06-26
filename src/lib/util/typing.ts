import { controlKeys } from "$lib/data/remap";
import type { LessonStats } from "$lib/stats";
import type { Config } from "$lib/config";
import { Action, CheckMode } from "$lib/types/types";
import type { WordState } from "$lib/word_state";


// https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType
// https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes

export function processInput(e: InputEvent, config: Config, word: WordState, stats: LessonStats) {
    if (e.inputType === 'deleteContentBackward' && config.backspace === true) {
        e.preventDefault();
        return (word.addBackspace(config.backspace)) ? Action.Refresh : Action.None;
    }

    if (e.inputType !== 'insertText') {
        e.preventDefault();
        return Action.None;
    }

    return processChars(e, config, word, stats);
}

export function processChars(e: InputEvent, config: Config, word: WordState, stats: LessonStats): Action {
    if (!e.data) return Action.None;

    let act = Action.None;

    // allow multiple chars (eg mobile input)
    for (const c of [...e.data]) {
        const mapped = config.remap.get(c);
        if (mapped === ' ') {
            const a = checkWordEnd({ key: ' ', preventDefault: () => { } }, config, word, stats);
            act |= a;
            if (a === Action.None) {
                word.addChar(mapped);
                act |= Action.CharAdded | Action.Refresh;
            }
        } else if (mapped !== undefined) {
            word.addChar(config.caseSensitive ? mapped : mapped.toLowerCase());
            act |= Action.CharAdded | Action.Refresh;
        }
    }

    if (act != Action.None) {
        word.addKeystroke();
        e.preventDefault();
    }

    return act;
}

type kbEvent = {
    key: string;
    preventDefault: () => void;
};

export function checkWordEnd(e: kbEvent, config: Config, word: WordState, stats: LessonStats): Action {
    if (e.key === 'Backspace') {
        word.addBackspace(config.backspace);
        e.preventDefault();
        return Action.Refresh;
    }

    if (e.key === 'Alt' || e.key === 'Shift' || e.key === 'Control') {
        e.preventDefault();
        return Action.None;
    }

    switch (config.checkMode) {
        case CheckMode.Char:
            return wordEndCharMode(e, config, word);
        case CheckMode.WordRepeat:
            return wordEndWordMode(e, word, stats);
    }
}

function wordEndWordMode(e: kbEvent, word: WordState, stats: LessonStats): Action {
    if (e.key === ' ' || e.key === 'Enter') {
        if (word.completed()) {
            e.preventDefault();
            return Action.NextWord | Action.Refresh;
        }

        stats.resetWord(word);
        word.reset(word.getWord());
        e.preventDefault();

        return Action.WordReset | Action.Refresh;
    }

    if (controlKeys.has(e.key)) {
        e.preventDefault();
    }

    return Action.None;
}

function wordEndCharMode(e: kbEvent, config: Config, word: WordState): Action {
    if (controlKeys.has(e.key)) {
        return Action.None;
    }
    
    if (word.atEnd()) {
        if (e.key === ' ') {
            e.preventDefault();
            return Action.NextWord | Action.Refresh;
        }

        if (!config.spaceOptional) {
            word.uncorrectedErrors += 1;
            e.preventDefault();
            return Action.MissedSpace | Action.NextWord | Action.Refresh;
        }

        return Action.NextWord | Action.Refresh;
    }

    return Action.None;
}

