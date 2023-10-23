import { base } from '$app/paths';
import { getInterfaceLangFromLocale } from './locales';

type LanguageObject = { [P in keyof Language]: string };

export class Language {
    lang: string = '';
    langName: string = '';
    stopMsg: string = '';
    inputNotStarted: string = '';
    inputPaused: string = '';
    notStarted: string = '';
    paused: string = '';
    yes: string = '';
    no: string = '';
    on: string = '';
    off: string = '';
    none: string = '';
    disabled: string = '';
    infinite: string = '';
    accept: string = '';
    ignore: string = '';
    stop: string = '';
    pause: string = '';
    resume: string = '';
    submit: string = '';
    cancel: string = '';
    close: string = '';
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
    lessonConfigDialogRandom: string = '';
    lessonConfigDialogUntil: string = '';
    lessonConfigDialogMinQueue: string = '';
    lessonConfigDialogWordBatchSize: string = '';
    lessonConfigDialogCheckMode: string = '';
    lessonConfigDialogCheckModeChars: string = '';
    lessonConfigDialogCheckModeWords: string = '';
    lessonConfigDialogAcceptBackspace: string = '';

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
        const interfacePath = getInterfaceLangFromLocale(navigator.language);
        return Language.load(interfacePath, fetchFn);
    }

    static async load(path: string, fetchFn: typeof fetch = fetch): Promise<Language> {
        const req = new Request(`${base}/data/lang/${path}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((lang: LanguageObject) => new Language(lang))
    }
}

