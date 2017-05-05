#!/usr/bin/env node
const meow = require('meow')

const cli = meow(
  `
  Usage
    $ chimi -f file

  Options
    --file, -f  File or glob matching multiple files

  Examples
    $ chimi -f README.md

    $ chimi -f doc/*.md
`,
  {
    alias: {
      f: 'file',
      h: 'help',
    },
  }
)

const runner = require('../lib/runner')
const config = require('../lib/config')

const file = cli.flags.file || config.file

runner(config.timeout, file)
