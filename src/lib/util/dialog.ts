import Dialog from "../components/dialog.svelte";
import Tts from "../components/dialogs/tts.svelte";
import Stats from "../components/dialogs/stats.svelte";
import LessonStatsLog from "../components/dialogs/lesson_stats_log.svelte";
import LessonConfig from "../components/dialogs/lesson_options.svelte";

import type { Config } from "../config";
import type { BaseStats, StatsLog } from "../stats";
import type { InnerDialogComponent, CloseFn } from "../types/types";
import type { Lesson } from "$lib/lessons/lesson";
import type { LessonTypingConfig, StorableBaseLesson } from "$lib/types/lessons";
import type { Audio } from "$lib/audio";
import EditLesson from "$lib/components/dialogs/edit_lesson.svelte";
import type { UserWordList } from "$lib/lessons/base/user_wordlist";
import { adaptive_store, get } from "$lib/db";
import type { TypoData } from "$lib/lessons/base/adaptive_list";
import type { OptAvailable, UserValue } from "$lib/types/forms";


export function showVoiceDialog(config: Config, db: IDBDatabase): Promise<Audio | undefined> {
    const dialogProps: DialogProps = { title: config.lang.ttsDialogTitle, content: Tts, hasSubmit: true, config, db }
    return createDialog(dialogProps);
}

export function showStatsDialog<T extends BaseStats>(title: string, config: Config, db: IDBDatabase, stats: T): Promise<boolean | undefined> {
    const dialogProps: DialogProps = { title, content: Stats, hasSubmit: false, config, db: undefined };
    const passProps = { stats };
    return createDialog(dialogProps, passProps);
}

export function showStatsConfirmDialog<T extends BaseStats>(config: Config, db: IDBDatabase, stats: T): Promise<boolean | undefined> {
    const dialogProps: DialogProps = { title: config.lang.statsDialogSaveTitle, content: Stats, hasSubmit: true, config, db: undefined, cancelLabel: config.lang.no, submitLabel: config.lang.yes };
    const passProps = { stats };
    return createDialog(dialogProps, passProps);
}

export function showLessonStatsLog(config: Config, db: IDBDatabase, lesson_name: string, stats: StatsLog) {
    const dialogProps: DialogProps = { title: config.lang.statsLogTitle.replace('%s', lesson_name), content: LessonStatsLog, hasSubmit: false, config, db, cancelLabel: config.lang.close };
    const passProps = { statsLog: stats };
    return createDialog(dialogProps, passProps);
}

export function showEditLessonDialog(config: Config, db: IDBDatabase, lesson: UserWordList | null): Promise<StorableBaseLesson | undefined> {
    const dialogProps: DialogProps = { title: (lesson !== null) ? config.lang.lessonDialogEditLesson : config.lang.lessonDialogAddLesson, content: EditLesson, hasSubmit: true, config, db, cancelLabel: config.lang.cancel, submitLabel: config.lang.save };
    const passProps = { lesson };
    return createDialog(dialogProps, passProps);
}

export async function showLessonConfigDialog(config: Config, db: IDBDatabase, lesson: Lesson, lessonOptions: Partial<LessonTypingConfig>, confirmPrompt: string | undefined): Promise<Promise<[Lesson, Partial<LessonTypingConfig>] | undefined>> {
    const adaptiveData = await get<TypoData>(db, adaptive_store, lesson.baseLesson().id);
    const dialogProps: DialogProps = { title: config.lang.lessonConfigDialogTitle, content: LessonConfig, hasSubmit: true, config, db, confirmPrompt };
    const passProps = { originalLesson: lesson, lessonOptions, adaptiveData };
    return createDialog(dialogProps, passProps);
}

export function initState<T>(override: OptAvailable<T>, initialState: UserValue<T>, inheritValue: T) {
    if (override !== 'enabled' && override !== 'disabled') {
		return override;
	} else if (initialState === 'inherit') {
		return inheritValue;
	} else {
		return initialState;
	}
}

interface DialogProps {
    title: string;
    content: InnerDialogComponent;
    hasSubmit: boolean;
    config: Config;
    db: IDBDatabase | undefined;
    closeLabel?: string;
    submitLabel?: string;
    cancelLabel?: string;
    confirmPrompt?: string;
}

function createDialog(dialogProps: DialogProps, passProps?: Object): Promise<any | undefined> {
    let closeCallback: CloseFn<any> = () => { };

    const promise = new Promise((resolve: CloseFn<any>) => {
        closeCallback = resolve;
    });

    const dialogComponent: Dialog<any> = new Dialog({
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
