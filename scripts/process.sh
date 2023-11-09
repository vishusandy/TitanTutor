#! /usr/bin/env bash

WORDLIST="input/concat.txt"

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
if [ "$SCRIPT_DIR" != "$PWD" ]; then
    cd "$SCRIPT_DIR" || exit 1
fi

TMPFOLDER=$(mktemp -d -p "$DIR")
if [[ ! "$TMPFOLDER" || ! -d "$TMPFOLDER" ]]; then
    echo "Could not create temp dir"
    exit 2
fi
function cleanup {
    rm -rf "$TMPFOLDER"
}
trap cleanup EXIT

mkdir -p output
mkdir -p input
cd "sources" || exit 3
for file in *; do
    [ -f "$file" ] && dd if="$file" of="$TMPFOLDER/$file" conv=lcase &>/dev/null
done
cd ../ || exit 5

cd input || exit 6
sort -u ./* | sort -u -o "../$WORDLIST" || exit 7
cd ../ || exit 8

# python -m filter "$WORDLIST" output/dvorak_homerow_no_di.txt -m 3 -x 15 -c aoeuhtns
# python -m filter "$WORDLIST" output/dvorak_homerow_with_di.txt -m 3 -x 15 -c aoeuhtnsid
