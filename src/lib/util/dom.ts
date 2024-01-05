import type { Language } from "../data/language";

export function addSpace(lang: Language, historyNode: HTMLElement) {
    const el = document.createElement('div');
    el.classList.add('spacer');
    // el.innerHTML =
    // 	"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path  d='M14.1 27.2l7.1 7.2 16.7-16.8'/></svg>";
    el.title = lang.space;
    historyNode.appendChild(el);
}

export function addMissedSpace(lang: Language, historyNode: HTMLElement) {
    const el = document.createElement('div');
    el.classList.add('missed-space');
    // el.innerHTML =
    // 	"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path  d='M14.1 27.2l7.1 7.2 16.7-16.8'/></svg>";
    el.title = lang.missedSpace;
    historyNode.appendChild(el);
}
