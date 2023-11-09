#!/usr/bin/env bash

WORDLIST="input/concat.txt"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
if [ "$SCRIPT_DIR" != "$PWD" ]; then
    cd "$SCRIPT_DIR" || exit 1
fi

python -m filter "$WORDLIST" output/dvorak_homerow_no_di.txt -m 3 -x 15 -c aoeuhtns
python -m filter "$WORDLIST" output/dvorak_homerow_with_di.txt -m 3 -x 15 -c aoeuhtnsid

python -m filter "$WORDLIST" output/dvorak_one_letters_words_homerow+toprow_no_fy.txt -m 1 -x 1 -c aoeuidhtnspgcrl
python -m filter "$WORDLIST" output/dvorak_two_letters_words_homerow+toprow_no_fy.txt -m 2 -x 2 -c aoeuidhtnspgcrl
python -m filter "$WORDLIST" output/dvorak_three_letters_words_homerow+toprow_no_fy.txt -m 3 -x 3 -c aoeuidhtnspgcrl
python -m filter "$WORDLIST" output/dvorak_four_letters_words_homerow+toprow_no_fy.txt -m 4 -x 4 -c aoeuidhtnspgcrl
python -m filter "$WORDLIST" output/dvorak_five_letters_words_homerow+toprow_no_fy.txt -m 5 -x 5 -c aoeuidhtnspgcrl

python -m filter "$WORDLIST" output/dvorak_one_letters_words_homerow+toprow_with_fy.txt -m 1 -x 1 -c aoeuidhtnspgcrlyf
python -m filter "$WORDLIST" output/dvorak_two_letters_words_homerow+toprow_with_fy.txt -m 2 -x 2 -c aoeuidhtnspgcrlyf
python -m filter "$WORDLIST" output/dvorak_three_letters_words_homerow+toprow_with_fy.txt -m 3 -x 3 -c aoeuidhtnspgcrlyf
python -m filter "$WORDLIST" output/dvorak_four_letters_words_homerow+toprow_with_fy.txt -m 4 -x 4 -c aoeuidhtnspgcrlyf
python -m filter "$WORDLIST" output/dvorak_five_letters_words_homerow+toprow_with_fy.txt -m 5 -x 5 -c aoeuidhtnspgcrlyf
