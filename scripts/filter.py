#!/usr/bin/env python3

import argparse
import sys
import io
import random
from typing import Optional


def filter_words(infile: io.TextIOWrapper, min: int, max: int, chars: Optional[set[str]], lower: bool, sort: bool, shuffle: bool) -> list[str]:
    words = []
    for word in infile:
        word = word.strip().lower() if lower else word.strip()
        if len(word) in range(min, max+1) and (chars is None or all(c in chars for c in word)):
            words.append(word)
    if sort:
        words.sort()
    elif shuffle:
        random.shuffle(words)
    return words


def write_words(words: list[str], outfile: io.TextIOWrapper):
    outfile.write('\n'.join(words))


def main():
    parser = argparse.ArgumentParser(description='Filter words')
    parser.add_argument('wordlist', metavar='infile', type=argparse.FileType(
        'r'), default=sys.stdin, help='wordlist file; omit to use stdin', nargs='?')
    parser.add_argument('outfile', nargs='?', type=argparse.FileType(
        'w'), default=sys.stdout, help='output file; omit to write to stdout')
    parser.add_argument('-m', '--min', type=int, default=1, metavar='LENGTH',
                        help='include only words with at least LENGTH chars')
    parser.add_argument('-x', '--max', type=int, default=50, metavar='LENGTH',
                        help='include only words with at most LENGTH chars')
    parser.add_argument('-c', '--chars', default=None,
                        help='only include words with these letters')
    parser.add_argument('--no-lower', dest='lower', action='store_false',
                        help='do not convert words to lowercase')
    parser.add_argument('--sort', action='store_true',
                        help='sort words alphabetically')
    parser.add_argument('--shuffle', action='store_true',
                        help='randomly shuffle the wordlist')

    args = parser.parse_args()

    chars = set(args.chars) if args.chars is not None else None
    words = filter_words(args.wordlist, args.min, args.max,
                         chars, args.lower, args.sort, args.shuffle)
    write_words(words, args.outfile)


if __name__ == '__main__':
    main()
