#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    file: 'f',
    help: 'h',
  },
})

const runner = require('../lib/runner')
const config = require('../lib/config')

const file = argv.file || config.file

if (argv.help) {
  console.log('Usage: chimi [-f file.md]')
} else {
  runner(config.timeout, file)
}
