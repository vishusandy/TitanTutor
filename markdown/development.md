
# Development

This app was designed to run from a static web host, such as GitHub pages.

All user data is stored locally in the browser (using IndexedDB).


## Installing Locally

```sh
git pull https://github.com/vishusandy/TitanTutor.git
npm install
```

## Development and Testing

```sh
npm run dev
# or
npm run dev -- --open
```

## Documentation

Documentation is available at [https://vishusandy.github.io/TitanTutor/docs/](https://vishusandy.github.io/TitanTutor/docs/).

After installing, the api docs can be generated locally with:

```sh
npx typedoc
# or
npm run docs
```

The documentation will be in the `public/docs` folder.

## Deployment

Builds happen automatically whenever changes are pushed to the main branch.

On push the `npm run build` and `npm run docs` commands are executed and the `public` folder is uploaded to the `gh-pages` branch.
