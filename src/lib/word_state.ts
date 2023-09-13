import { LetterState } from './types';
import { type Config, BackspaceMode, CheckMode } from './config';
import type { B } from 'vitest/dist/types-63abf2e0';

export class WordState {
    word: string;
    state: LetterState[];
    input: string;

    constructor(word: string) {
        this.word = word;
        this.state = word.split('').map((_) => { return LetterState.Incomplete });
        this.input = '';
    }

    empty(): boolean {
        return this.word === '';
    }

    atEnd(): boolean {
        return this.input.length === this.word.length;
    }

    reset(word: string) {
        this.word = word;
        this.state = this.word.split('').map((_) => LetterState.Incomplete);
        this.input = '';
    }

    completed(): boolean {
        return this.word === this.input;
    }

    isBackspace(config: Config, e: KeyboardEvent): boolean {
        if (e.key !== 'Backspace') {
            return false;
        }

        if (config.backspace == BackspaceMode.Accept) {
            this.input = this.input.slice(0, -1);
            this.state = this.mapState();
        }

        e.preventDefault();

        return true;
    }

    add(config: Config, e: KeyboardEvent): boolean {
        let mapped = config.mapping(e.key);

        if (mapped == null) {
            return false;
        }

        this.input += mapped;
        this.state = this.mapState();

        e.preventDefault();

        return true;
    }

    private mapState(): LetterState[] {
        return this.state.map((_, i) => {
            if (this.input.length === i) return LetterState.Active;
            if (this.input.length > i) {
                if (this.word[i] === this.input[i]) return LetterState.Complete;
                return LetterState.Error;
            } else return LetterState.Incomplete;
        });
    }
}
