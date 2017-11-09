const debug = require('debug')('chimi')

const { taskOfSnippets } = require('./lib')
const { createSpinner, reportResults } = require('./reporter')

function runner(glob, config, { silent }) {
  const spinner = createSpinner()

  spinner.start()

  return taskOfSnippets(config, glob)
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
