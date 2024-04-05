import { base } from '$app/paths';
import type { StatsEntry } from '$lib/types/stats';
import { interfaceLang } from './locales';
import { type Plurals, type Dur, type PluralStrs} from '$lib/types/lang';

export type LanguageObject = { [P in keyof Language]: string };

export class Language {
    readonly lang: string = '';
    readonly langName: string = '';
    readonly tutorTitle: string = '';
    readonly settingsTitle: string = '';
    readonly manageSettingsTitle: string = '';
    readonly textDirection: string = 'ltr';
    readonly loading: string = '';
    readonly stopMsg: string = '';
    readonly inputNotStarted: string = '';
    readonly inputPaused: string = '';
    readonly notStarted: string = '';
    readonly paused: string = '';
    readonly restartLesson: string = '';
    readonly yes: string = '';
    readonly no: string = '';
    readonly on: string = '';
    readonly off: string = '';
    readonly delete: string = '';
    readonly edit: string = '';
    readonly caseSensitive: string = '';
    readonly caseInsensitive: string = '';
    readonly none: string = '';
    readonly disabledLabel: string = '';
    readonly infinite: string = '';
    readonly accept: string = '';
    readonly ignore: string = '';
    readonly start: string = '';
    readonly stop: string = '';
    readonly pause: string = '';
    readonly resume: string = '';
    readonly submit: string = '';
    readonly cancel: string = '';
    readonly close: string = '';
    readonly save: string = '';
    readonly back: string = '';
    readonly day: string = '';
    readonly days: string = '';
    readonly hour: string = '';
    readonly hours: string = '';
    readonly minute: string = '';
    readonly minutes: string = '';
    readonly second: string = '';
    readonly seconds: string = '';
    readonly notAvailable: string = '';
    readonly enable: string = '';
    readonly wordMode: string = '';
    readonly charMode: string = '';
    readonly space: string = '';
    readonly missedSpace: string = ''
    readonly useUserValue: string = '';
    readonly openTtsDialog: string = '';
    readonly ttsDialogTitle: string = '';
    readonly ttsLanguageLabel: string = '';
    readonly ttsVoiceLabel: string = '';
    readonly ttsPitchLabel: string = '';
    readonly ttsRateLabel: string = '';
    readonly ttsVolumeLabel: string = '';
    readonly ttsTextLabel: string = '';
    readonly ttsMuteLabel: string = '';
    readonly ttsPreview: string = '';
    readonly ttsExampleText: string = '';
    readonly ttsNotEnabled: string = '';
    readonly openUserStatsDialog: string = '';
    readonly openSessionStatsDialog: string = '';
    readonly statsDialogSaveTitle: string = '';
    readonly statsDialogSessionTitle: string = '';
    readonly statsDialogUserTitle: string = '';
    readonly statsDialogDuration: string = '';
    readonly statsDialogKeystrokes: string = '';
    readonly statsDialogWords: string = '';
    readonly statsDialogChars: string = '';
    readonly statsDialogUncorrectedErrors: string = '';
    readonly statsDialogCorrectedErrors: string = '';
    readonly statsDialogGrossWpm: string = '';
    readonly statsDialogNetWpm: string = '';
    readonly statsDialogAccuracy: string = '';
    readonly resetStats: string = '';
    readonly statsDialogTrackUserStats: string = '';
    readonly statsResetPrompt: string = '';
    readonly openLessonConfigDialog: string = '';
    readonly lessonConfigDialogTitle: string = '';
    readonly lessonConfigConfirmSubmit: string = '';
    readonly lessonConfigClearAdaptive: string = '';
    readonly lessonConfigClearAdaptiveConfirm: string = '';
    readonly openConfigDialog: string = '';
    readonly configDialogTitile: string = '';
    readonly configSpaceOptional: string = '';
    readonly configAdaptive: string = '';
    readonly configCharModeOnly: string = '';
    readonly configRandom: string = '';
    readonly configUntil: string = '';
    readonly configMinQueue: string = '';
    readonly configWordBatchSize: string = '';
    readonly configCheckMode: string = '';
    readonly configCheckModeChars: string = '';
    readonly configCheckModeWords: string = '';
    readonly configAcceptBackspace: string = '';
    readonly configLogLessonStats: string = '';
    readonly configCaseSensitive: string = '';
    readonly configStopHotkey: string = '';
    readonly configPauseHotkey: string = '';
    readonly configRemap: string = '';
    readonly configLanguage: string = '';
    readonly seriesNextLesson: string = '';
    readonly seriesPrevLesson: string = '';
    readonly seriesSelectLesson: string = '';
    readonly incompatibleWrapper: string = '';
    readonly incompatibleLesson: string = '';
    readonly classStockWords: string = '';
    readonly classUserWords: string = '';
    readonly classRandomChars: string = '';
    readonly classAdaptive: string = '';
    readonly classRandomize: string = '';
    readonly classUntil: string = '';
    readonly actionClearData: string = '';
    readonly actionClearDataPrompt: string = '';
    readonly openLessonEditDialog: string = '';
    readonly lessonDialogCustomTitle: string = '';
    readonly lessonDialogStockTitle: string = '';
    readonly lessonDialogNewLesson: string = '';
    readonly lessonDialogAddLesson: string = '';
    readonly lessonDialogEditLesson: string = '';
    readonly lessonDialogLessonName: string = '';
    readonly lessonDialogLessonId: string = '';
    readonly lessonDialogWords: string = '';
    readonly lessonDialogExistingId: string = '';
    readonly lessonDialogConfirmDelete: string = '';
    readonly lessonDialogStartLesson: string = '';
    readonly lessonDialogEditLessonSettings: string = '';
    readonly statsLogTitle: string = '';
    readonly statsLogNoStats: string = '';
    readonly statsLogTotal: string = '';
    readonly statsLogAverage: string = '';
    readonly statsLogSessions: string = '';
    readonly statsLogBackspaces: string = '';
    readonly statsLogWordErrors: string = '';
    readonly durationOneSecond: string = '';
    readonly durationOtherSecond: string = '';
    readonly durationOneMinute: string = '';
    readonly durationOtherMinute: string = '';
    readonly durationOneHour: string = '';
    readonly durationOtherHour: string = '';
    readonly durationOneDay: string = '';
    readonly durationOtherDay: string = '';
    readonly durationShortOneSecond: string = '';
    readonly durationShortOtherSecond: string = '';
    readonly durationShortOneMinute: string = '';
    readonly durationShortOtherMinute: string = '';
    readonly durationShortOneHour: string = '';
    readonly durationShortOtherHour: string = '';
    readonly durationShortOneDay: string = '';
    readonly durationShortOtherDay: string = '';
    readonly resetLessonStats: string = '';
    
    [index: string]: string;
    
    constructor(
        lang: LanguageObject,
    ) {
        for (const key in lang) {
            if (this.hasOwnProperty(key)) {
                this[key] = lang[key];
            }
        }
    }


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




function test() {
    
}
