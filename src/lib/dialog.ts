import type { Audio } from "./audio";
import Dialog from "./components/dialog.svelte";
import Voice from "./components/dialogs/voice.svelte";
import Stats from "./components/dialogs/stats.svelte";
import type { Config } from "./config";
import type { UserStats } from "./stats";
import type { innerDialogComponent, closeFn } from "./types";

export function createVoiceDialog(config: Config) {
    return createDialog<Audio>(config.lang.ttsDialogTitle, Voice, true, config);
}

export function createStatsDialog<T extends UserStats>(config: Config, stats: T) {
    return createDialog<undefined>(config.lang.statsDialogSessionTitle, Stats, false, config, { stats });
}

export function createDialog<T>(title: string, content: innerDialogComponent, submit: boolean, config: Config, props?: Object): Promise<T | undefined> {
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
            hasSubmit: submit,
            config,
            passProps: props
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
