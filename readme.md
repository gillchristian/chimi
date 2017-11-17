<h1 align="center">chimi</h1>

<p align="center">Validate JavaScript code from your README.</p>

[ ![Codeship Status for Huemul/chimi](https://app.codeship.com/projects/2da4eb10-a041-0135-b319-0606c02fee13/status?branch=master)](https://app.codeship.com/projects/253867)

## Table of contents

1. [The problem](#the-problem)
1. [This solution](#this-solution)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Configuration](#configuration)
1. [Inspiration](#inspiration)
1. [Similar and complementary tools](#similar-and-complementary-tools)

## The problem

> A great OpenSource project is only as great as its documentation.
>
> _Probably me_.

We ~~ideally~~ test our code and care about its quality, but not so much about documentation. Snippets of code in the docs sometimes have typos or even are out of sync with the library version.

## This solution

`chimi` aims to bring the same principles we use for automating tests of our code to test the documentation. By parsing Markdown files and runnings the JavaScript snippets to check if everything is alright.

## Installation

```bash
$ yarn add chimi --dev
$ npm i chimi --save-dev
```

Global works too

```bash
$ yarn global add chimi
$ npm i -g chimi
```

## Usage

```
  Validate the JavaScript code of your Markdown files

  Usage
  $ chimi -f <file>

  Options
    --file,    -f      File or glob matching multiple files (default: "README.md")
    --help,    -h      Show help
    --silent           Prevent snippets from printing messages through the console
    --version, -v, -V  Show version

  Examples
    $ chimi -f README.md

    $ chimi -f 'doc/*.md'
```

## Configuration

To let `chimi` find the snippets you have to indicate the snippet language using either `js` or `javascript` like so:

```
```js
```

```
```javascript
```

You can configure `chimi` using a configuration file, it might be a JSON or JavaScript file (`chimi.config.js`, `.chimirc`) and also an object as the `chimi` property in the `package.json`:

```js
{
  "dependencies": [
    "trae",
    { "module": "lodash", "name": "_" },
    { "module": "./config", "name": "config" },
    { "module": "es6-promise" }
  ],
  "globals": {
    "answer": 42,
    "add": "(a, b) => a + b",
    "message": "'hello world'",
    "fruits": "['orange', 'apple']",
    "config": "{ port: 8080 }"
  },
  "aliases": {
    "my-lib": "./dist/my-lib"
  },
  "file": "readme.md",
  "timeout": 5000
}
```

**NOTE**: _the `.chimirc` file has to be a valid JSON_.

**NOTE**: _if it is a JavaScript file, an object has to be exported_.

### `dependencies`: `Array<string|object>`

A list of dependencies to be `require`d on each snippet.

Pass a string when the variable name and the module to be required are equal. To cover other cases you can pass an object with variable name as the `name` property, the module as the `module` property, if the name is missing the require will not have an assignment.

The dependencies in the example will generate these `require`s:

```js
const trae   = require('trae')
const _      = require('lodash')
const config = require('./config')

require('es6-promise')
```

These dependencies will be added to your snippet before running it so you don't have to do it on every snippet. You can use it to implicitly refer to your project or to do some setup for the snippets (i.e. mock an http request).

### `globals`: `object`

A list of variable declarations to add on each snippet. Each key represents the variable name and the value is, well, the value.

The globals in the example will generate these declarations:

```js
let answer  = 42
let add     = (a, b) => a + b
let message = 'hello world'
let fruits  = ['orange', 'apple']
let port    = { port: 8080 }
```

**NOTE**: _strings must be quoted_. E.g. consider the following example.

```
{
  "globals": {
    "wrong": "hello world"
    "right": "'hello world'"
  }
}
```

```js
let wrong = hello world
let right = 'hello world'
```

### `alias`: `object`

An object containing aliases for imports and requires, with the format `{ [path to replace]: alias }`.

The `alias` in the example will transform following snippet:

```js
import myLib from 'my-lib'

const lib = require('my-lib')
```

to this before running it.

```js
import myLib from './dist/my-lib'

const lib = require('./dist/my-lib')
```

### `file`: `string`

Default: `README.md`.

The path to the file/s you want to parse. It can also be a [glob](https://github.com/isaacs/node-glob#glob-primer). Be sure to specify only `.md` files.

### `timeout`: `number`

Default: `5000`.

The time, in miliseconds, to wait for the snippet execution before considering it a failure.

### Snippet annotations

Markdown snippets can be annotated by adding extra stuff on the same line as the language. Don't worry this annotations do not show on the web.

Chimi supports the following annotations:

#### Skip

To skip a snippet from running:

```
```js (skip)
```

This is useful when the snippet has purposely incompleted or broken code.

## Inspiration

`chimi` was inspired on [budziq](https://github.com/budziq)'s [rust-skeptic](https://github.com/budziq/rust-skeptic), a similar tool for Rust, by [franleplant](https://github.com/franleplant) suggestion:

> _would be cool to have it [rust-skeptic] for JS_.

## Similar and complementary tools

There are other tools that will help you improve your JS in Markdown.

- [`prettier`](https://prettier.io/): Formas JavaScript, Markdown and other languages. Since `v1.8` it supports [formatting JS snippets inside Markdown files](https://github.com/prettier/prettier/releases/tag/1.8.0).

- [`eslint-plugin-markdown`](https://github.com/eslint/eslint-plugin-markdown): Lints JavaScript code blocks in Markdown documents. Since `chimi` runs the code, there are things `eslint` could miss, e.g. you added a breaking change to the library but forgot to update your docs. But if you only want to lint your code, then `eslint-plugin-markdown` is all you need.
