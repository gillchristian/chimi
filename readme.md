# chimi

> Run JavaScript snippets from your Markdown files.

## How it works

`chimi` parses Markdown files and runs the JavaScript snippets to check if everything is alright.

## Configuration

To let `chimi` find what snippets to run you have to indicate the code snippet language using either `js` or `javascript` like so:

```
```js
```

```
```javascript
```

You can configure `chimi` through an `rc` file, `.chimirc`:

```
{
  "dependencies": { 
    "trae": "trae",
    "lodash": "_",
    "./config": "config",
    "es6-promise: ""
  },
  "file": "readme.md",
  "timeout": 5000
}
```
_NOTE_: _the `.chimirc` file has to be a valid JSON_.

`dependencies`: `object`

A list of dependencies to be `require`d on each snippet. Each key represents the path name and the value is the variable name, if the value is [`falsy`](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) (_we recommend using an empty string_) the `require` statement will be not assigned to a variable.

The depenencies in the example will generate these `require`s:
```
let trae   = require('trae')
let _      = require('lodash')
let config = require('./config')

require('es6-promise')
```

These dependencies will be added to your snippet before running it so you don't have to do it on every snippet.

`file`: `string`

Default: `README.md`.

The path to the file/s you want to parse. It can also be a [glob](https://github.com/isaacs/node-glob#glob-primer). Be sure to specify only `.md` files.

`timeout`: `number`

Default: `5000`.

The time, in miliseconds, to wait for the snippet execution before considering it a failure.

## TODO

### V1
- [ ] CLI
  - [ ] Configuration (`.chimi.js(on)?|.chimirc`).
  - [ ] `--help`.
  - [x] Log failures. 

### Future

- [ ] CLI
  - [ ] Improve current interface. _Jest like interface when running/watching_.
  - [ ] Run multiple files.
- [ ] Transpile with Babel. _Check for project Babel config_. (?)
- [ ] Lint with Eslint. _If project has Eslint configured_.(?)
- [ ] Environment. _Use [`jsdom`](https://github.com/tmpvar/jsdom)_?
- [ ] Snippet metadata. _Using MD snippets flags_ (?)
- [ ] Provide a programmatic API.

