# chimi

> Run JavaScript snippets from your Markdown files.

## How it works

`chimi` parses Markdown files and runs the JavaScript snippets to check if everything is alright.

## Configuration

To let `chimi` find the snippets you have to indicate the snippet language using either `js` or `javascript` like so:

```
```js
```

```
```javascript
```

You can configure `chimi` using a configuration file, it might be a JSON or JavaScript file and also an object as the `chimi` property in the `package.json`:

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
_NOTE_: _if it is a JavaScript file, an object has to be exported_.

`dependencies`: `object`

A list of dependencies to be `require`d on each snippet. Each key represents the path name and the value is the variable name, if the value is an empty string the `require` statement will be not assigned to a variable.

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
- [ ] Tests
- [x] CLI
  - [x ] Configuration (`.chimi.js(on)?|.chimirc`).
  - [x] `--help`.
  - [x] Log failures. 

### Future

- [ ] CLI
  - [ ] Improve current interface. _Jest like interface when running/watching_.
- [ ] Process code
  - [ ] Transpile with Babel. _Check for project Babel config_. (?)
  - [ ] Lint with Eslint. _If project has Eslint configured_.(?)
- [ ] Environment. _Use [`jsdom`](https://github.com/tmpvar/jsdom)_?
- [ ] Snippet metadata. _Using MD snippets flags_
- [ ] Provide a programmatic API.

