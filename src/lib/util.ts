import { LetterState } from './types';


function letterState(input: string, word: string, i: number): LetterState {
    if (input.length < i) {
        return LetterState.Incomplete;
    }

    if (input.length === i) {
        return LetterState.Active;
    }

    if (input[i] === word[i]) {
        return LetterState.Complete;
    }

    return LetterState.Error;
}
