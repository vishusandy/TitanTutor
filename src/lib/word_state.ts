import { LetterState } from './types';
import { type Config, BackspaceMode } from './config';

export class WordState {
    word: string;
    wordChars: string[];
    input: string;
    rawInput: string[] = [];
    inputChars: string[] = [];
    state: LetterState[];
    corretedErrors: number = 0;
    uncorrectedErrors: number = 0;
    keystrokes: number = 0;
    wordErrors: number = 0; // only for word mode - number of failed attempts at this word

    constructor(word: string) {
        this.word = word;
        this.state = word.split('').map((_) => { return LetterState.Incomplete });
        this.input = '';
        this.wordChars = [...word];
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

    isChar(config: Config, e: KeyboardEvent): boolean {
        let mapped = config.mapping.get(e.key);

        if (mapped == null) {
            return false;
        }

        this.addChar(mapped);

        e.preventDefault();

        return true;
    }

    private addChar(char: string) {
        this.input += char;
        this.inputChars = [...this.input];
        this.state = this.mapState();

        // https://dev.to/coolgoose/quick-and-easy-way-of-counting-utf-8-characters-in-javascript-23ce
        if (this.inputChars.length <= this.wordChars.length) {

        } else {
            this.uncorrectedErrors += 1;
        }
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
