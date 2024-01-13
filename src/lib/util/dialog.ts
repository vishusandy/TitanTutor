import Dialog from "../components/dialog.svelte";
import Voice from "../components/dialogs/voice.svelte";
import Stats from "../components/dialogs/stats.svelte";
import LessonConfig from "../components/dialogs/lesson_options.svelte";

import type { Audio } from "../audio";
import type { Config } from "../types/config";
import type { BaseStats } from "../stats";
import type { InnerDialogComponent, CloseFn } from "../types/types";
import type { Lesson, LessonTypingConfig } from "$lib/lessons/lesson";
import User from "../components/dialogs/user_config.svelte";


export function showVoiceDialog(config: Config) {
    const dialogProps = { title: config.lang.ttsDialogTitle, content: Voice, hasSubmit: true, config }
    return createDialog<Audio>(dialogProps);
}

export function showStatsDialog<T extends BaseStats>(title: string, config: Config, stats: T) {
    const dialogProps: DialogProps = { title, content: Stats, hasSubmit: false, config };
    const passProps = { stats };
    return createDialog<boolean>(dialogProps, passProps);
}
export function showStatsConfirmDialog<T extends BaseStats>(config: Config, stats: T) {
    const dialogProps: DialogProps = { title: config.lang.statsDialogSaveTitle, content: Stats, hasSubmit: true, config, cancelLabel: config.lang.no, submitLabel: config.lang.yes };
    const passProps = { stats };
    return createDialog<boolean>(dialogProps, passProps);
}

export function showConfigDialog(config: Config) {
    const dialogProps: DialogProps = { title: config.lang.configDialogTitile, content: User, hasSubmit: true, config };
    return createDialog<Config>(dialogProps);
}

export function showLessonConfigDialog(config: Config, lesson: Lesson, lessonOptions: Partial<LessonTypingConfig>) {
    const dialogProps: DialogProps = { title: config.lang.lessonConfigDialogTitle, content: LessonConfig, hasSubmit: true, config, confirmPrompt: config.lang.lessonConfigConfirmSubmit };
    const passProps = { lesson, lessonOptions };
    return createDialog<[Lesson, Partial<LessonTypingConfig>]>(dialogProps, passProps);
}

interface DialogProps {
    title: string;
    content: InnerDialogComponent;
    hasSubmit: boolean;
    config: Config;
    closeLabel?: string;
    submitLabel?: string;
    cancelLabel?: string;
    confirmPrompt?: string;
}

// function createDialog<T>(title: string, content: InnerDialogComponent, hasSubmit: boolean, config: Config, passProps?: Object): Promise<T | undefined> {
function createDialog<T>(dialogProps: DialogProps, passProps?: Object): Promise<T | undefined> {
    let closeCallback: CloseFn<T> = () => { };

    const promise = new Promise((resolve: CloseFn<T>) => {
        closeCallback = resolve;
    });

    const dialogComponent: Dialog<T> = new Dialog({
        target: document.body,
        props: {
            closeCallback,
            ...dialogProps,
            passProps,
        }
    });

    return promise.finally(() => {
        dialogComponent.$destroy();
    });
}
