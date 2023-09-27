
export class Audio {
    rate: number = 1.0; // 0.5 to 2.0
    pitch: number = 1.0; // 0.0 to 2.0
    volume: number = 1.0; // 0.0 to 1.0
    voice: SpeechSynthesisVoice;

    constructor(voice: SpeechSynthesisVoice, rate: number, pitch: number, volume: number) {
        this.rate = rate;
        this.pitch = pitch;
        this.volume = volume;
        this.voice = voice;
    }

    play(text: string) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = this.voice;
        utter.rate = this.rate;
        utter.pitch = this.pitch;
        speechSynthesis.speak(utter);
    }
}

export function getLanguages(): Map<string, SpeechSynthesisVoice[]> {

    let list = speechSynthesis.getVoices().sort(sortVoices);
    let voices: Map<string, SpeechSynthesisVoice[]> = new Map();

    let entry;
    for (const v of list) {
        const lang = v.name.split('+')[0];
        if ((entry = voices.get(lang))) {
            entry.push(v);
        } else {
            voices.set(lang, [v]);
        }
    }

    return voices;
}

export function displayVoice(s: string, lang: string): string {
    if (s === lang)
        return "Default";

    const idx = s.indexOf("+");
    if (idx !== -1)
        return s.substring(idx + 1);

    return s;
}

export function getDefaultLang(defaultLangs: string[], langs: Map<string, SpeechSynthesisVoice[]>): string | null {
    let v;

    for (const d of defaultLangs) {
        if ((v = langs.get(d)) && v.length !== 0) {
            return d;
        }
    }

    return null;
}

function sortVoices(a: SpeechSynthesisVoice, b: SpeechSynthesisVoice) {
    return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
}
