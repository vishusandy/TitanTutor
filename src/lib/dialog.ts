import type { Audio } from "./audio";
import Dialog from "./components/dialog.svelte";
import Voice from "./components/voice.svelte";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog() {
    return createDialog<Audio>(Voice);
}

export function createDialog<T>(innerComponent: innerDialogComponent<T>): Promise<T> {
    let close: closeFn<T> = () => { };

    const promise = new Promise((resolve: closeFn<T>) => {
        close = resolve;
    });

    const dialogComponent: Dialog<T> = new Dialog({
        target: document.body,
        props: {
            closeCallback: close,
            content: innerComponent,
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
