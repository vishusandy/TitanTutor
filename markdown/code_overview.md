# Code Overview

## Project Structure

```text
    src/
        lib/
            components/ - reusable svelte components
            conf/       - available lessons, default values, and fallback values
            data/       - code to retrieve data from the static/data folder
            lessons/    - base lesson classes and wrappers
            types/      - common type definitions
            util/       - miscellaneous reusable functions
    
    static/
        data/ - user-setting-dependent data that is loaded as-needed
            kbmaps/ - files to map keys from one keyboard layout to another
            lang/   - interface languages
            words/  - word lists
```

## Adding Lessons

### StockWordList
Most lessons will use the `StockWordList` class, which will create a new lesson based on a list of words.  This is the most convenient option when a lesson only needs to show a certain words without any custom behavior.

To create a new lesson using `StockWordList`:
- create a new .json file inside the `static/data/words/` folder containing the desired words within an array
- add an entry to the `stockLessons` Map in `src/lib/conf/lessons.ts`

### Custom Class

A custom lesson class can be added if a lesson requires more complex behavior, like mixing words and characters in the same lesson.

Steps to create a new `BaseLesson` class:
- Create a new file for the base class in `src/lib/lessons/base`.
- Implement all of the required `Lesson` methods specified in `src/lib/lessons/lesson.ts`.
- Add a class typeid to `src/lib/conf/lesson_types.ts`.
- Add an entry to the `baseClasses` array in `src/lib/data/lesson_classes.ts`.

The other base classes can be used as a reference on how to implement the various methods.

## Adding Interface Languages

Steps to create a new interface language:
- Create a new file in `static/data/lang`.  The file must have a .json extension.
  - The naming convention for language files is to use the locale as the name.
  - The file will be a json object that contains **ALL** of the properties of the `Language` class in `src/lib/data/language.ts`.
- Add an entry to the `languageList` array.
- Add an entry to the `interfaceLanguagePaths` map in `src/lib/conf/locales` to map a locale to the language.

Note: currently only simple language support is available.  Words/phrases are simply inserted without any changes from grammar or word ordering to other text.

## Adding Keyboard Remappings

Keyboard remappings allow a user to type in a different keyboard layout than their computer is currently set to.

- Create a new file in `static/data/kbmaps`.
  - The file must be a json object with values defined in the `RemapJSON` type of `/src/lib/conf/kbmaps.ts`
- Create a new entry in the `keyboardRemappings` array in `src/lib/conf/kbmaps.ts`.
  - The filename (without .json extension) is the same as its ID.

