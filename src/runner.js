const { taskOfSnippets } = require('./lib')
const { createSpinner, reportResults } = require('./reporter')

function runner(dependencies, globals, timeout, glob, silent) {
  const spinner = createSpinner()

  spinner.start()

  return taskOfSnippets(dependencies, globals, timeout, glob)
    .map(reportResults(spinner, glob, silent))
    .fork(
      error => spinner.fail(error.message),
      (results = { reject: 1 }) => {
        process.exit(Boolean(results.reject) ? 1 : 0)
      }
    )
}

module.exports = runner
