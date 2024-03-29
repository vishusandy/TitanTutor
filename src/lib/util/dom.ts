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
    el.classList.add('missed-space', 'spacer');
    // el.innerHTML =
    // 	"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path  d='M14.1 27.2l7.1 7.2 16.7-16.8'/></svg>";
    el.title = lang.missedSpace;
    historyNode.appendChild(el);
}

export function updateCheckboxProperties(checkboxInput: HTMLInputElement, checked: boolean, indeterminate: boolean, disabled: boolean = false) {
    checkboxInput.checked = checked;
    checkboxInput.indeterminate = indeterminate;
    checkboxInput.disabled = disabled;
}

export function adjustTextarea(e: Event) {
    const t = <HTMLTextAreaElement | null>e.target;
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = t.scrollHeight + 'px';
}
