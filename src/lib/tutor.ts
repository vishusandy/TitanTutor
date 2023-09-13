import { LetterState, type WordState, blank_state } from './types';

class Tutor {
    currentWord: WordState = blank_state;
    history: WordState[] = [];
    queue: string[] = [];
}
