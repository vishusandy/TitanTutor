import type { Audio } from "./audio";
import Dialog from "./components/dialog.svelte";
import Voice from "./components/voice.svelte";
import type { Language } from "./language";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog(lang: Language, audio: Audio | undefined) {
    return createDialog<Audio>(lang.ttsDialogTitle, Voice, lang, audio);
}

export function createDialog<T>(title: string, content: innerDialogComponent<T>, lang: Language, formData?: T, props?: Object): Promise<T | undefined> {
    let closeCallback: closeFn<T> = () => { };

    const promise = new Promise((resolve: closeFn<T>) => {
        closeCallback = resolve;
    });

    const dialogComponent: Dialog<T> = new Dialog({
        target: document.body,
        props: {
            closeCallback,
            title,
            content,
            lang,
            formData,
            ...props
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
