## Expand Rollup Build Options by File Glob Patterns

[![NPM version](https://badge.fury.io/js/rollup-glob-opts.png)](http://badge.fury.io/js/rollup-glob-opts)
[![Build Status](https://github.com/prantlf/rollup-glob-opts/workflows/Test/badge.svg)](https://github.com/prantlf/rollup-glob-opts/actions)
[![Dependency Status](https://david-dm.org/prantlf/rollup-glob-opts.svg)](https://david-dm.org/prantlf/rollup-glob-opts)
[![devDependency Status](https://david-dm.org/prantlf/rollup-glob-opts/dev-status.svg)](https://david-dm.org/prantlf/rollup-glob-opts#info=devDependencies)

Helps maintaining many [Rollup] build targets by using file glob patterns. Reduces copying & pasting of options in the [Rollup configuration].

## Synopsis

Let us assume the following project structure with two components and their tests:

    src/
    ├── first
    │   ├── first.md
    │   ├── first.ts
    │   └── first.test.ts
    └── second
        ├── second.md
        ├── second.ts
        └── second.test.ts

[Rollup configuration] usually contains options for building each component and each test:

```js
export default [
  {
    input: 'src/first/first.ts',
    output: { file: 'dist/first.js' }
  },
  {
    input: 'src/second/second.ts',
    output: { file: 'dist/second.js' }
  }
  {
    input: 'src/first/first.test.ts',
    output: { file: 'src/first/first.test.js' }
  },
  {
    input: 'src/second/second.test.js',
    output: { file: 'src/second/second.test.js' }
  }
]
```

The copies of options for building components and their tests can be avoided by specifying each build target only once using file patterns with name placeholders delimited by square brackets:

```js
import globOpts from 'rollup-glob-opts'

export default async () => [
  ...await globOpts({
    input: 'src/[name]/[name].ts',
    output: { file: 'dist/[name].js' }
  }),
  ...await globOpts({
    input: 'src/[name]/[name].test.ts',
    output: { file: 'src/[name]/[name].test.js' }
  })
]
```

The name placeholders in the [`input` property] are replaced with `*` and looked for in the local file system. One build options object is created for each pattern match.

The [`output` property] can point either to an object or to an array of objects, if multiple bundles are generated from one input.

## Installation

You can install this package using your favourite Node.js package manager:

```sh
npm i -D rollup-glob-opts
yarn add -D rollup-glob-opts
pnpm i -D rollup-glob-opts
```

## Debugging

If you need to investigate an unexpected behaviour of the file globbing, you can use the process environment, for example:

```
DEBUG=glob-opts rollup -c
...
  glob-opts expanding "src/[name]/[name].ts" +0ms
  glob-opts 4 files found for "src/*/*.ts". +1ms
  glob-opts matching "src/first/first.test.ts" with /^src\/([^/]+)\/([^/]+)\.ts$/ +0ms
  glob-opts dropping "src/first/first.test.ts", inconsistent "[name]": "first" != "first.test" +0ms
  glob-opts matching "src/first/first.ts" with /^src\/([^/]+)\/([^/]+)\.ts$/ +0ms
  glob-opts matching "src/second/second.test.ts" with /^src\/([^/]+)\/([^/]+)\.ts$/ +1ms
  glob-opts dropping "src/second/second.test.ts", inconsistent "[name]": "second" != "second.test" +0ms
  glob-opts matching "src/second/second.ts" with /^src\/([^/]+)\/([^/]+)\.ts$/ +0ms
  glob-opts 2 files matched "src/[name]/[name].ts". +0ms
  glob-opts matching "src/first/first.ts" with /^src\/([^/]+)\/([^/]+)\.ts$/ +0ms
  glob-opts new output "dist/first.js" for "dist/[name].js" +0ms
  glob-opts matching "src/second/second.ts" with /^src\/([^/]+)\/([^/]+)\.ts$/ +0ms
  glob-opts new output "dist/second.js" for "dist/[name].js" +0ms
...
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code using `npm test`.

## License

Copyright (c) 2021-2024 Ferdinand Prantl

Licensed under the MIT license.

[Rollup]: https://rollupjs.org/
[Rollup configuration]: https://rollupjs.org/guide/#configuration-files
[`input` property]: https://rollupjs.org/guide/en/#input
[`output` property]: https://rollupjs.org/guide/en/#outputdir
