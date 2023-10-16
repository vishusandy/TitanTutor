import { letterStateString, type LetterState } from "./types";
import type { WordState } from "./word_state";

export type Span = {
    text: string;
    state: LetterState;
};

export function addToHistory(to: HTMLElement, w: WordState) {
    const spans = getSpans(w);
    renderSpans(to, spans);
}

export function getSpans(w: WordState): Span[] {
    if (w.wordChars.length === 0) return [];
    let spans: Span[] = [];
    let state: LetterState = w.state[0];
    let num: number = 0;

    for (let i = 1; i < w.wordChars.length; i++) {
        if (w.state[i] !== state) {
            state = w.state[i];
            spans.push({ text: w.wordChars[i], state: w.state[i] });
            num += 1;
        } else {
            spans[num].text += w.wordChars[i];
        }
    }

    return spans;
}

function renderSpans(to: HTMLElement, spans: Span[]) {
    if (spans.length === 0) return;

    const els = spans.map((span) => {
        const el = document.createElement('span');
        el.classList.add(letterStateString(span.state));
        el.textContent = span.text;
        return el;
    });

    const span = document.createElement('span');
    span.classList.add('word')
    span.append(...els);

    to.appendChild(span);
}
