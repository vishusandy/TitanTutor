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

    static async loadLang(file: string, fetchFn: typeof fetch): Promise<Language> {
        const req = new Request(`${base}/data/lang/${file}.json`);

        return fetchFn(req)
            .then((resp) => resp.json())
            .then((lang: Object) => new Language(lang))
    }

    static async loadUserLang(fetchFn: typeof fetch) {
        const lang = localStorage.getItem('language') ?? defaultLang;
        return this.loadLang(languagePaths.get(lang) ?? <string>languagePaths.get(defaultLang), fetchFn);
    }
}

const defaultLang: string = 'en-US';

const languagePaths: Map<string, string> = new Map([
    ['en-US', 'en-US']
]);
