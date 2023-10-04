import type { Audio } from "./audio";
import Dialog from "./components/dialog.svelte";
import Voice from "./components/voice.svelte";
import type { Language } from "./language";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog(lang: Language) {
    return createDialog<Audio>(lang.ttsDialogTitle, Voice, lang);
}

export function createDialog<T>(title: string, innerComponent: innerDialogComponent<T>, lang: Language): Promise<T | undefined> {
    let close: closeFn<T> = () => { };

    const promise = new Promise((resolve: closeFn<T>) => {
        close = resolve;
    });

    const dialogComponent: Dialog<T> = new Dialog({
        target: document.body,
        props: {
            closeCallback: close,
            title: title,
            content: innerComponent,
            lang: lang,
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
