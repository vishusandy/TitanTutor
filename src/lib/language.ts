import { base } from '$app/paths';

export class Language {
    lang: string = '';
    langName: string = '';
    stopMsg: string = '';
    inputNotStarted: string = '';
    inputPaused: string = '';
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
    openTtsDialog: string = '';
    openUserStatsDialog: string = '';
    openSessionStatsDialog: string = '';
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

    constructor(
        lang: Object,
    ) {
        for (const key in lang) {
            if (this.hasOwnProperty(key)) {
                // @ts-ignore
                this[key] = lang[key];
            }
        }
    }

    [index: string]: string;

    static async loadLang(path: string, fetchFn: typeof fetch): Promise<Language> {
        const req = new Request(`${base}/data/lang/${path}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((lang: Object) => new Language(lang))
    }
}

