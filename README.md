# yaml-unist-parser

[![npm](https://img.shields.io/npm/v/yaml-unist-parser.svg)](https://www.npmjs.com/package/yaml-unist-parser)
[![build](https://img.shields.io/travis/ikatyang/yaml-unist-parser/master.svg)](https://travis-ci.org/ikatyang/yaml-unist-parser/builds)
[![coverage](https://img.shields.io/codecov/c/github/ikatyang/yaml-unist-parser/master.svg)](https://codecov.io/gh/ikatyang/yaml-unist-parser)

A YAML parser that produces output compatible with [unist](https://github.com/syntax-tree/unist)

[Changelog](https://github.com/ikatyang/yaml-unist-parser/blob/master/CHANGELOG.md)

## Install

```sh
# using npm
npm install --save yaml-unist-parser yaml@^1.0.0-beta

# using yarn
yarn add yaml-unist-parser yaml@^1.0.0-beta
```

## Usage

```ts
const yamlUnistParser = require("yaml-unist-parser");

const ast = yamlUnistParser.parse(`
- hello
- world
`);
```

See [`src/types.ts`](https://github.com/ikatyang/yaml-unist-parser/blob/master/src/types.ts) for more info about the AST.

## Development

```sh
# lint
yarn run lint

# build
yarn run build

# test
yarn run test
```

## License

MIT © [Ika](https://github.com/ikatyang)
