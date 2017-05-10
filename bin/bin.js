#!/usr/bin/env node
const meow = require('meow')

const msg = `
  Usage
    $ chimi -f file

  Options
    --file,   -f  File or glob matching multiple files (default: "README.md")
    --config, -c  Use configuration from this file (default: ".chimirc")

  Examples
    $ chimi -f README.md

    $ chimi -f doc/*.md

    $ chimi -c chimi.config.js
`

const cli = meow(msg, {
  alias: {
    f: 'file',
    c: 'config',
    h: 'help',
  },
  default: {
    config: '.chimirc',
  },
})

const runner = require('../lib/runner')
const eitherConfig = require('../lib/config')(cli.flags.config)

if (eitherConfig.isLeft) {
  console.error(eitherConfig.merge())
  process.exit(1)
}

const config = eitherConfig.get()
const file = cli.flags.file || config.file

runner(config.dependencies, config.timeout, file)
