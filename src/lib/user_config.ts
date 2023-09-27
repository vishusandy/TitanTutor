
// For a list of possible languages see:
// http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry

export class UserConfig {
    stop: string;
    pause: string;
    lang: string[]; // array to match different browsers' languages

    constructor(stop: string, pause: string, lang: string[]) {
        this.stop = stop;
        this.pause = pause;
        this.lang = lang;
    }

    static default(): UserConfig {
        return new UserConfig('F7', 'F4', mapLocale(navigator.language));
    }
}

export function mapLocale(locale: string): string[] {
    const map: Map<string, string[]> = new Map([
        ['en-US', ['English (America)']],
    ]);

    return map.get(locale) ?? ['English (America)'];
}
