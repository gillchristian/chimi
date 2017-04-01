#!/usr/bin/env node
const argv   = require('minimist')(process.argv.slice(2), {
  alias: {
    file: 'f'
  }
})

const runner = require('./runner')
const config = require('./config.js')

const file = argv.file || config.file

runner(file)
