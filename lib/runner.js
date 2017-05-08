const { taskOfSnippets } = require('./lib')
const { createSpinner, reportResults } = require('./reporter')

function runner(dependencies, timeout, glob) {
  const spinner = createSpinner()

  spinner.start()

  return taskOfSnippets(dependencies, timeout, glob).fork(
    error => spinner.fail(error.message),
    reportResults(spinner, glob)
  )
}

module.exports = runner
