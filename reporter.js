const R     = require('ramda')
const ora   = require('ora')
const chalk = require('chalk')

const PASS = chalk.bgGreen('PASS')
const FAIL = chalk.bgRed('FAIL')

const createSpinner = () => ora('Running snippets.')

const logSuccess = (result, file) => {
  const id = chalk.white.bold(`${result.id}-${file}`)
  console.log(chalk.black(`${PASS} ${id}`))
}

const logFailure = (result, file) => {
  const id = chalk.white.bold(`${result.id}-${file}`)
  console.log(chalk.black(`${FAIL} ${id}`))
}

// logCases :: String -> [Case] -> ()
const logCases = file => R.map(result => (result.ok ? logSuccess : logFailure)(result, file))

const logSummary = ({success, reject}) => {
  console.log(`  ${chalk.bold.green('Succeded')}: ${success}`)
  console.log(`  ${chalk.bold.red('Rejected')}: ${reject}`)
}

// listErrors :: List(Object) -> FileName -> ()
const listErrors = (results, file) => {
  console.log(chalk.bold.white(`\nErrors\n`))

  results
    .filter(R.compose(Boolean, R.prop('error')))
    .forEach(c => {

      console.log(chalk.white(`// --- Snippet #${c.id} in ${chalk.bold(file)} ---`))
      console.log(chalk.red(c.error.stack))
      console.log()
    })

}

// countCases :: List(Object) -> {success: Number, success: Number}
const countCases = results => {
  const success = results.reduce((acc, cur) => cur.ok ? acc + 1 : acc, 0)
  const reject = results.reduce((acc, cur) => cur.ok ? acc : acc + 1, 0)

  return {success, reject}
}

// reportResults :: Spinner -> FileName -> [Object] -> ()
const reportResults = R.curry((spinner, file, results) => {
  const cases = countCases(results)

  if (cases.reject) {
    listErrors(results, file)
  }

  spinner.succeed(chalk.bold.green(`Run ${results.size} snippets.\n`))

  const sortedResults = R.sortBy(R.prop('id'), results.toArray())

  logCases(file)(sortedResults)

  console.log()

  logSummary(cases)
})

// reportNoFilesFound :: Spinner -> FileName -> ()
const reportNoFilesFound = (spinner, file) => () => {
  spinner.fail(`No JS snippets found on ${file}.`)
  console.log(`\n¯\\_(ツ)_/¯`)
}

module.exports = {
  createSpinner,
  reportNoFilesFound,
  reportResults
}
