
// https://www.speedtypingonline.com/typing-equations

const wordLen: number = 5;

export class Stats {
    start: Date = new Date();
    keystrokes: number = 0;
    charErrors: number = 0;
    wordErrors: number = 0;
    backspaces: number = 0;
    words: number = 0;
    wordChars: number = 0;



}

class StatsComplete {
    stats: Stats;
    dur: number;
    grossWpm: number;
    netWpm: number;

    constructor(stats: Stats) {
        let now = new Date();
        this.stats = stats;
        this.dur = (now.getTime() - this.stats.start.getTime()) * 1000;
        this.grossWpm = (this.stats.keystrokes / 5) / (this.dur / 60);
        this.netWpm = 0;

    }
}
