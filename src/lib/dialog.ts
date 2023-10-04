import type { Audio } from "./audio";
import Dialog from "./components/dialog.svelte";
import Voice from "./components/voice.svelte";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog() {
    return createDialog<Audio>('Text To Speech', Voice);
}

export function createDialog<T>(title: string, innerComponent: innerDialogComponent<T>): Promise<T | undefined> {
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
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
