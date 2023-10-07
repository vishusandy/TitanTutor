
function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

export const rateClamp: [number, number] = [0.5, 2.0];
export const pitchClamp: [number, number] = [0.0, 2.0];
export const volumeClamp: [number, number] = [0.0, 1.0];

export class Audio {
    rate: number = 1.0; // 0.5 to 2.0
    pitch: number = 1.0; // 0.0 to 2.0
    volume: number = 1.0; // 0.0 to 1.0
    voice: SpeechSynthesisVoice;
    mute: boolean;
    queueSize: number = 1;

    constructor(voice: SpeechSynthesisVoice, rate: number, pitch: number, volume: number, mute: boolean, queueSize: number) {
        this.rate = clamp(rate, ...rateClamp);
        this.pitch = clamp(pitch, ...pitchClamp);
        this.volume = clamp(volume, ...volumeClamp);
        this.voice = voice;
        this.mute = mute;
        this.queueSize = queueSize;
    }

    play(text: string | string[]) {
        if (this.mute) return;

        let t: string;
        if (Array.isArray(text)) {
            if (text.length > this.queueSize) {
                t = text.slice(0, this.queueSize).join(' ')
            } else {
                t = text.join(' ');
            }
        } else {
            t = text
        }

        const utter = new SpeechSynthesisUtterance(t);
        utter.voice = this.voice;
        utter.rate = this.rate;
        utter.pitch = this.pitch;
        speechSynthesis.speak(utter);
    }

    static serialize(audio: Audio | undefined): string {
        if (audio === undefined) {
            return '';
        }

        return JSON.stringify({
            rate: audio.rate,
            pitch: audio.pitch,
            volume: audio.volume,
            voice: audio.voice.name,
            mute: audio.mute,
            queueSize: audio.queueSize
        });
    }

    static deserialize(s: string): Audio | undefined {
        if (s === '') { return undefined; }

        const o: any = JSON.parse(s);
        const voice = speechSynthesis.getVoices().find((v: SpeechSynthesisVoice) => v.name === o.voice);

        if (voice === undefined) return undefined;
        return new Audio(voice, o.rate, o.pitch, o.volume, o.mute, o.queueSize);
    }
}

export function loadVoiceLangMap(): Map<string, SpeechSynthesisVoice[]> {
    let list = speechSynthesis.getVoices().sort(sortVoices);
    let voices: Map<string, SpeechSynthesisVoice[]> = new Map();

    let entry;
    for (const v of list) {
        const lang = getLangFromVoice(v.name);
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
    return getVoiceName(s);
}


function sortVoices(a: SpeechSynthesisVoice, b: SpeechSynthesisVoice): number {
    return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
}

export function getLangFromVoice(s: string): string {
    const pos = s.indexOf('+');
    return (pos !== -1) ? s.substring(0, pos) : s;
}

export function getVoiceName(s: string): string {
    const pos = s.indexOf('+');
    return (pos !== -1) ? s.substring(pos + 1) : s;
}
