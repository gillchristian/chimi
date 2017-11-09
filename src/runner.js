const R = require('ramda')
const debug = require('debug')('chimi')

const runSnippets = require('./run-snippet')
const { extractSnippets } = require('./extractor')
const { createSpinner, reportResults } = require('./reporter')

function runner(glob, config, { silent }) {
  const spinner = createSpinner()

  spinner.start()

  return extractSnippets(config, glob)
    .then(R.map(runSnippets(config.timeout)))
    .then(a => Promise.all(a))
    .then(reportResults(spinner, glob, silent))
    .then((results = { reject: 1 }) => {
      process.exit(results.reject ? 1 : 0)
    })
    .catch(error => {
      debug('Error %O', error)
      spinner.fail(error.message)
    })
}

module.exports = runner
