const R = require('ramda')
const ora = require('ora')
const chalk = require('chalk')
const pluralize = require('pluralize')

const FAIL = chalk.inverse.bold.red(' FAIL ')
const PASS = chalk.inverse.bold.green(' PASS ')

const createSpinner = () => ora('Running snippets.')

const logSuccess = (result, file) => {
  const id = chalk.white.bold(`${result.id}-${file}`)
  console.log(`${PASS} ${id}`)
}

const logFailure = (result, file) => {
  const id = chalk.white.bold(`${result.id}-${file}`)
  console.log(`${FAIL} ${id}`)
}

// logCases :: String -> [Case] -> ()
const logCases = file =>
  R.map(result => (result.ok ? logSuccess : logFailure)(result, file))

const logSummary = ({ files, success, reject }) => {
  console.log(`  ${chalk.bold.green('Files')}: ${files}`)
  if (success > 0) {
    console.log(`  ${chalk.bold.green('Snippets succeded')}: ${success}`)
  }
  if (reject > 0) {
    console.log(`  ${chalk.bold.red('Snippets rejected')}: ${reject}`)
  }
}

// listOutput :: [Object]  -> ()
const listOutput = results => {
  console.log(chalk.bold.white(`\nOutput\n`))

  results.forEach(({ file, snippets }) => {
    console.log(chalk.bold.white(`----- ${file} ----- \n`))

    snippets
      .filter(R.compose(Boolean, R.path(['stdout', 'length'])))
      .forEach((c, i) => {
        console.log(chalk.white(`--- Snippet #${c.id + 1} ---`))
        console.log(chalk.white(c.stdout))
        console.log()
      })
  })
}

// listErrors :: [Object] -> ()
const listErrors = (results, file) => {
  console.log(chalk.bold.red(`\nErrors\n`))

  results.forEach(({ file, snippets }) => {
    console.log(chalk.bold.white(`----- ${file} ----- \n`))

    snippets.filter(R.compose(R.not, R.prop('ok'))).forEach((c, i) => {
      console.log(chalk.white(`--- Snippet #${c.id + 1} ---`))
      if (c.timeout) {
        const err = new Error(`Snippet #${c.id + 1} from ${file} timed out.`)
        console.log(chalk.red(err))
      } else {
        console.log(chalk.red(c.stderr))
      }
      console.log()
    })
  })
}

// reduceSnippets :: [Result] -> (Int -> Snippet) -> Int
const _reduceSnippets = (rs, f) =>
  rs.reduce((acc, { snippets }) => acc + snippets.reduce(f, 0), 0)
const reduceSnippets = R.curry(_reduceSnippets)

const reducers = [
  // success: counts the s.ok === true cases
  (acc, cur) => (cur.ok ? acc + 1 : acc),
  // reject: counts the s.ok === false cases
  (acc, cur) => (cur.ok ? acc : acc + 1),
  // timeout: counts the s.timeout === true cases
  (acc, cur) => (cur.timeout ? acc + 1 : acc),
]

// Cases ::  {files: Int, success: Int, reject: Int, timeout: Int, total: Int }

// countCases :: [FileResult] -> Cases
const countCases = results => {
  const [success, reject, timeout] = reducers.map(reduceSnippets(results))

  const total = results.reduce((acc, { snippets }) => acc + snippets.length, 0)

  return { files: results.length, success, reject, timeout, total }
}

// reportNoFilesFound :: Spinner -> (String -> ())
const reportNoFilesFound = spinner => glob => {
  spinner.fail(`No JS snippets found on ${chalk.red(glob)}.`)
  console.log(chalk.bold('\n¯\\_(ツ)_/¯'))
}

// reportResults :: Spinner -> String -> Boolean -> ([FileResult] -> Cases)
const reportResults = (spinner, glob, silent) => results => {
  const cases = countCases(results)

  if (cases.files === 0) {
    reportNoFilesFound(spinner)(glob)
    return
  }

  // sortList :: [{ id: String, ... }] -> [{ id: String, ... }]
  const sortList = R.sortBy(R.prop('id'))

  const sortedResults = results.map(
    R.evolve({
      snippets: sortList,
    })
  )

  if (!silent) {
    listOutput(sortedResults)
  }

  if (cases.reject) {
    listErrors(sortedResults)
  }

  const s = pluralize('snippet', cases.total)
  const f = pluralize('file', cases.files)

  spinner.succeed(
    chalk.bold.green(`Run ${cases.total} ${s} from ${cases.files} ${f}.\n`)
  )

  sortedResults.forEach(({ file, snippets }) => logCases(file)(snippets))

  console.log() // ¯\_(ツ)_/¯

  logSummary(cases)

  return cases
}

module.exports = {
  createSpinner,
  reportNoFilesFound,
  reportResults,
}
