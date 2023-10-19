import { describe, it, expect, test } from 'vitest';
import prand from "pure-rand";

// describe('sum test', () => {
//     it('adds 1 + 2 to equal 3', () => {
//         expect(1 + 2).toBe(3);
//     });
// });

test('prand inclusive max test', () => {
    let rng = prand.xoroshiro128plus(Math.floor(Math.random() * 18446744073709551615));
    let n = 0;
    let found: boolean = false;
    for (let i = 0; i < 10000; i++) {
        [n, rng] = prand.uniformIntDistribution(1, 3, rng);
        if (n === 3) {
            found = true;
            break;
        }
    }
    expect(found).toBe(true);
});

