
# Titan Tutor

## Features

- Text-to-speech support to say the words aloud
- Tracks typing statistics
- Supports adaptive lessons to increase the frequency of problem characters
- Multilingual support (currently only in English, help wanted in this area)
- Supports keyboard mappings to allow typing in a different keyboard layout than the computer is currently set to
- Currently supports QWERTY, Dvorak, and Colemak lessons and typing layouts for English.
- Stores everything locally in the browser without need for a backend server
- Allows setting options for each lesson than override user settings


## Installing

```sh
git pull https://github.com/vishusandy/TitanTutor.git
npm install
```

## Development

```sh
npm run dev
# or
npm run dev -- --open
```

## Documentation

To generate the api docs run:

```sh
npm run docs
```

The documentation will be in the `api` folder.

## Technical Overview

See [Overview](README_TECHNICAL.md) for details about the code.
