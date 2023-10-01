
// https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
export function shuffle(input: string[]) {
    let array = [...input];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


export function mapLocale(locale: string): string[] {
    const map: Map<string, string[]> = new Map([
        ['en-US', ['English (America)']],
    ]);

    return map.get(locale) ?? ['English (America)'];
}
