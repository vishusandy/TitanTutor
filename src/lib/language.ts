import { base } from '$app/paths';

export class Language {
    lang: string = '';
    langName: string = '';
    stopMsg: string = '';
    inputNotStarted: string = '';
    inputPaused: string = '';
    submit: string = '';
    cancel: string = '';
    ttsDialogTitle: string = '';
    ttsLanguageLabel: string = '';
    ttsVoiceLabel: string = '';
    ttsPitchLabel: string = '';
    ttsRateLabel: string = '';
    ttsVolumeLabel: string = '';
    ttsTextLabel: string = '';
    ttsPreview: string = '';
    ttsExampleText: string = '';
    ttsNotEnabled: string = '';
    openTtsDialog: string = '';

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

    static async loadLang(lang: string, fetchFn: typeof fetch): Promise<Language> {
        const req = new Request(`${base}/data/lang/${lang}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((lang: Object) => new Language(lang))
    }
}

