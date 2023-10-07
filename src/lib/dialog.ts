import type { Audio } from "./audio";
import Dialog from "./components/dialog.svelte";
import Voice from "./components/voice.svelte";
import type { Config } from "./config";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog(config: Config) {
    return createDialog<Audio>(config.lang.ttsDialogTitle, Voice, config);
}

export function createDialog<T>(title: string, content: innerDialogComponent, config: Config, props?: Object): Promise<T | undefined> {
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
            config,
            passProps: props
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
