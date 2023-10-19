import Dialog from "./components/dialog.svelte";
import Voice from "./components/dialogs/voice.svelte";
import Stats from "./components/dialogs/stats.svelte";
import LessonConfig from "./components/dialogs/lesson_config.svelte";

import type { Audio } from "./audio";
import type { Config, LessonTypingConfig } from "./config";
import type { BaseStats } from "./stats";
import type { InnerDialogComponent, CloseFn } from "./types";
import type { Lesson } from "./lessons/lessons";


export function showVoiceDialog(config: Config) {
    return createDialog<Audio>(config.lang.ttsDialogTitle, Voice, true, config);
}

export function showStatsDialog<T extends BaseStats>(title: string, config: Config, stats: T) {
    return createDialog<undefined>(title, Stats, false, config, { stats });
}

export function showLessonConfigDialog(config: Config, lesson: Lesson, lessonConfigOverrides: Partial<LessonTypingConfig>) {
    return createDialog<Lesson>(config.lang.lessonConfigDialogTitle, LessonConfig, true, config, { lesson, lessonConfigOverrides });
}


function createDialog<T>(title: string, content: InnerDialogComponent, submit: boolean, config: Config, props?: Object): Promise<T | undefined> {
    let closeCallback: CloseFn<T> = () => { };

    const promise = new Promise((resolve: CloseFn<T>) => {
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
