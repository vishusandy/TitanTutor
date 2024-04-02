import { base } from '$app/paths';
import { interfaceLang } from './locales';

export type LanguageObject = { [P in keyof Language]: string };

export class Language {
    lang: string = '';
    langName: string = '';
    tutorTitle: string = '';
    settingsTitle: string = '';
    manageSettingsTitle: string = '';
    textDirection: string = 'ltr';
    loading: string = '';
    stopMsg: string = '';
    inputNotStarted: string = '';
    inputPaused: string = '';
    notStarted: string = '';
    paused: string = '';
    restartLesson: string = '';
    yes: string = '';
    no: string = '';
    on: string = '';
    off: string = '';
    delete: string = '';
    edit: string = '';
    caseSensitive: string = '';
    caseInsensitive: string = '';
    none: string = '';
    disabledLabel: string = '';
    infinite: string = '';
    accept: string = '';
    ignore: string = '';
    start: string = '';
    stop: string = '';
    pause: string = '';
    resume: string = '';
    submit: string = '';
    cancel: string = '';
    close: string = '';
    save: string = '';
    back: string = '';
    day: string = '';
    days: string = '';
    hour: string = '';
    hours: string = '';
    minute: string = '';
    minutes: string = '';
    second: string = '';
    seconds: string = '';
    notAvailable: string = '';
    enable: string = '';
    wordMode: string = '';
    charMode: string = '';
    space: string = '';
    missedSpace: string = ''
    useUserValue: string = '';
    openTtsDialog: string = '';
    ttsDialogTitle: string = '';
    ttsLanguageLabel: string = '';
    ttsVoiceLabel: string = '';
    ttsPitchLabel: string = '';
    ttsRateLabel: string = '';
    ttsVolumeLabel: string = '';
    ttsTextLabel: string = '';
    ttsMuteLabel: string = '';
    ttsPreview: string = '';
    ttsExampleText: string = '';
    ttsNotEnabled: string = '';
    openUserStatsDialog: string = '';
    openSessionStatsDialog: string = '';
    statsDialogSaveTitle: string = '';
    statsDialogSessionTitle: string = '';
    statsDialogUserTitle: string = '';
    statsDialogDuration: string = '';
    statsDialogKeystrokes: string = '';
    statsDialogWords: string = '';
    statsDialogChars: string = '';
    statsDialogUncorrectedErrors: string = '';
    statsDialogCorrectedErrors: string = '';
    statsDialogGrossWpm: string = '';
    statsDialogNetWpm: string = '';
    statsDialogAccuracy: string = '';
    statsDialogClearUserStats: string = '';
    statsDialogTrackUserStats: string = '';
    statsResetPrompt: string = '';
    openLessonConfigDialog: string = '';
    lessonConfigDialogTitle: string = '';
    lessonConfigConfirmSubmit: string = '';
    lessonConfigClearAdaptive: string = '';
    lessonConfigClearAdaptiveConfirm: string = '';
    openConfigDialog: string = '';
    configDialogTitile: string = '';
    configSpaceOptional: string = '';
    configAdaptive: string = '';
    configCharModeOnly: string = '';
    configRandom: string = '';
    configUntil: string = '';
    configMinQueue: string = '';
    configWordBatchSize: string = '';
    configCheckMode: string = '';
    configCheckModeChars: string = '';
    configCheckModeWords: string = '';
    configAcceptBackspace: string = '';
    configLogLessonStats: string = '';
    configCaseSensitive: string = '';
    configStopHotkey: string = '';
    configPauseHotkey: string = '';
    configRemap: string = '';
    configLanguage: string = '';
    seriesNextLesson: string = '';
    seriesPrevLesson: string = '';
    seriesSelectLesson: string = '';
    incompatibleWrapper: string = '';
    incompatibleLesson: string = '';
    classStockWords: string = '';
    classUserWords: string = '';
    classRandomChars: string = '';
    classAdaptive: string = '';
    classRandomize: string = '';
    classUntil: string = '';
    actionClearData: string = '';
    actionClearDataPrompt: string = '';
    openLessonEditDialog: string = '';
    lessonDialogCustomTitle: string = '';
    lessonDialogStockTitle: string = '';
    lessonDialogNewLesson: string = '';
    lessonDialogAddLesson: string = '';
    lessonDialogEditLesson: string = '';
    lessonDialogLessonName: string = '';
    lessonDialogLessonId: string = '';
    lessonDialogWords: string = '';
    lessonDialogExistingId: string = '';
    lessonDialogConfirmDelete: string = '';
    lessonDialogStartLesson: string = '';
    lessonDialogEditLessonSettings: string = '';
    statsLogTitle: string = '';
    statsLogNoStats: string = '';

    constructor(
        lang: LanguageObject,
    ) {
        for (const key in lang) {
            if (this.hasOwnProperty(key)) {
                this[key] = lang[key];
            }
        }
    }

    [index: string]: string;

    static async default(fetchFn: typeof fetch = fetch): Promise<Language> {
        const interfacePath = interfaceLang(navigator.language);
        return Language.load(interfacePath, fetchFn);
    }

    static async load(path: string, fetchFn: typeof fetch = fetch): Promise<Language> {
        const req = new Request(`${base}/data/lang/${path}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((lang: LanguageObject) => new Language(lang))
    }
}

