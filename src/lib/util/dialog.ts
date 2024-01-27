import Dialog from "../components/dialog.svelte";
import Voice from "../components/dialogs/voice.svelte";
import Stats from "../components/dialogs/stats.svelte";
import LessonConfig from "../components/dialogs/lesson_options.svelte";

import type { Audio } from "../audio";
import type { Config } from "../types/config";
import type { BaseStats } from "../stats";
import type { InnerDialogComponent, CloseFn } from "../types/types";
import type { Lesson } from "$lib/lessons/lesson";
import type { LessonTypingConfig } from "$lib/types/lessons";
import User from "../components/dialogs/user_config.svelte";


export function showVoiceDialog(config: Config, db: IDBDatabase) {
    const dialogProps = { title: config.lang.ttsDialogTitle, content: Voice, hasSubmit: true, config, db }
    return createDialog<Audio>(dialogProps);
}

export function showStatsDialog<T extends BaseStats>(title: string, config: Config, db: IDBDatabase, stats: T) {
    const dialogProps: DialogProps = { title, content: Stats, hasSubmit: false, config, db };
    const passProps = { stats };
    return createDialog<boolean>(dialogProps, passProps);
}
export function showStatsConfirmDialog<T extends BaseStats>(config: Config, db: IDBDatabase, stats: T) {
    const dialogProps: DialogProps = { title: config.lang.statsDialogSaveTitle, content: Stats, hasSubmit: true, config, db, cancelLabel: config.lang.no, submitLabel: config.lang.yes };
    const passProps = { stats };
    return createDialog<boolean>(dialogProps, passProps);
}

export function showConfigDialog(config: Config, db: IDBDatabase) {
    const dialogProps: DialogProps = { title: config.lang.configDialogTitile, content: User, hasSubmit: true, config, db };
    return createDialog<Config>(dialogProps);
}

export async function showLessonConfigDialog(config: Config, db: IDBDatabase, lesson: Lesson, lessonOptions: Partial<LessonTypingConfig>): Promise<Promise<[Lesson, Partial<LessonTypingConfig>] | undefined >> {
    const dialogProps: DialogProps = { title: config.lang.lessonConfigDialogTitle, content: LessonConfig, hasSubmit: true, config, db, confirmPrompt: config.lang.lessonConfigConfirmSubmit };
    const passProps = { lesson, lessonOptions };
    return createDialog<Promise<[Lesson, Partial<LessonTypingConfig>]>>(dialogProps, passProps);
}

interface DialogProps {
    title: string;
    content: InnerDialogComponent;
    hasSubmit: boolean;
    config: Config;
    db: IDBDatabase;
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
