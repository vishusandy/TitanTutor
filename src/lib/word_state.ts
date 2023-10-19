import { LetterState } from './types';
import type { Config } from './config';
import { Action } from './types';
import type { Remap } from './remap';

export class CompletedWord {
    word: string[];
    state: LetterState[];

    constructor(word: string[], state: LetterState[]) {
        this.word = word;
        this.state = state;
    }
}

export class WordState {
    word: string;
    input: string;
    state: LetterState[];
    correctedErrors: number = 0;
    uncorrectedErrors: number = 0;
    keystrokes: number = 0;
    backspaces: number = 0;
    wordAttempts: number = 0;
    wordChars: string[];
    inputChars: string[] = [];
    wordInputAttempts: string[] = [];

    constructor(word: string) {
        this.word = word;
        this.state = word.split('').map((_) => { return LetterState.Incomplete });
        this.input = '';
        this.wordChars = [...word];
    }

    getWord(): string {
        return this.word;
    }

    empty(): boolean {
        return this.word.length === 0;
    }

    atEnd(): boolean {
        return this.input.length === this.word.length;
    }

    reset(word: string) {
        if (this.input.length !== 0)
            this.wordInputAttempts.push(this.input);
        this.word = word;
        this.wordChars = [...word];
        this.state = this.wordChars.map((_, i) => (i == 0) ? LetterState.Active : LetterState.Incomplete);
        this.input = '';
        this.wordAttempts += 1;
    }

    completed(): boolean {
        return this.getWord() === this.input;
    }

    isBackspace(config: Config, e: KeyboardEvent): boolean {
        if (e.key !== 'Backspace') {
            return false;
        }

        this.addBackspace(config);

        e.preventDefault();
        return true;
    }

    isChar(config: Config, kbmap: Remap, e: InputEvent): Action {
        if (!e.data) return Action.None;

        let act = Action.None;

        // allow multiple chars (eg mobile input)
        for (const c of e.data) {
            const mapped = kbmap.get(c);
            if (mapped !== undefined) {
                this.addChar(mapped);
                act = Action.CharAdded;
            }
        }

        if (act != Action.None) {
            this.addKeystroke();
            e.preventDefault();
        }

        return act;
    }

    addKeystroke() {
        this.keystrokes += 1;
    }

    addBackspace(config: Config): boolean {
        this.keystrokes += 1;

        if (config.backspace === true) {
            if (this.inputChars.length !== 0) {
                this.backspaces += 1;
                if (this.state[this.inputChars.length - 1] === LetterState.Error) {
                    this.correctedErrors += 1;
                    this.uncorrectedErrors = Math.max(this.uncorrectedErrors - 1, 0);
                }
            }

            this.inputChars.pop();
            this.input = this.inputChars.join('').toString();
            this.state = this.mapState();
            return true;
        }

        return false;
    }

    private addChar(char: string) {
        this.input += char;
        this.inputChars = [...this.input];
        this.state = this.mapState();

        // https://dev.to/coolgoose/quick-and-easy-way-of-counting-utf-8-characters-in-javascript-23ce
        if (this.inputChars.length <= this.wordChars.length) {
            const i = this.inputChars.length - 1;
            if (this.inputChars[i] !== this.wordChars[i]) {
                this.uncorrectedErrors += 1;
            }
        } else {
            this.uncorrectedErrors += 1;
        }
    }

    private mapState(): LetterState[] {
        return this.state.map((_, i) => {
            if (this.inputChars.length === i) return LetterState.Active;
            if (this.inputChars.length > i) {
                if (this.wordChars[i] === this.inputChars[i]) return LetterState.Complete;
                return LetterState.Error;
            } else return LetterState.Incomplete;
        });
    }
}
