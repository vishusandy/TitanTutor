import Dialog from "./components/dialog.svelte";
import Voice from "./components/voice.svelte";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog() {
    return createDialog(Voice);
}

export function createDialog(innerComponent: innerDialogComponent): Promise<any> {
    let close: closeFn = () => { };

    const promise = new Promise((resolve: closeFn) => {
        close = resolve;
    });

    const dialogComponent: Dialog = new Dialog({
        target: document.body,
        props: {
            close,
            content: innerComponent,
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
