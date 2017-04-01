const { taskOfSnippets } = require('./lib')
const {
  createSpinner,
  reportNoFilesFound,
  reportResults
} = require('./reporter')

function runner(file) {
  const spinner = createSpinner()

  spinner.start()

  return taskOfSnippets(file).fork(
    reportNoFilesFound(spinner, file),
    reportResults(spinner, file)
  )
}

module.exports = runner
