import prand from "pure-rand";

export const seed = () => Date.now() ^ (Math.random() * 0x100000000);
export const randGen = () => prand.xoroshiro128plus(seed());


