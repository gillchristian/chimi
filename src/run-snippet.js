// Run snippet in another process. Return promise with status code, stdout and stderr

const { exec } = require('child_process')
const fs = require('fs')

const debug = require('debug')('chimi')
const R = require('ramda')

// validateResult :: Int -> String -> String -> Bool
const validateResult = (code, signal, stderr) =>
  code === 0 && !signal && stderr.length === 0

// Result :: { id: String, ok: Bool, code: Int, signal: String, stdout: String, stderr: String }
// FileResult :: { file: String, results: [Result] }

// runSnippet :: Int -> Snippet -> Promise(Result)
function runSnippetUncurried(timeout, { value, id }) {
  const fileName = `snippet-${Math.random()}.js`
  debug('Starting snippet %o', id)

  fs.writeFileSync(fileName, value)

  const child = exec(`node ${fileName}`)

  let stdout = ''
  child.stdout.on('data', data => {
    stdout += data
  })

  let stderr = ''
  child.stderr.on('data', data => {
    stderr += data
  })

  const timeoutID = setTimeout(() => {
    child.kill('SIGKILL')
  }, timeout)

  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      clearTimeout(timeoutID)

      // the async version requires a callback, and
      // providing one makes the process to never exit
      fs.unlinkSync(fileName)

      debug('Finishing snippet %o', id)
      resolve({
        id,
        ok: validateResult(code, signal, stderr),
        code,
        signal,
        stdout,
        stderr,
        timeout: signal === 'SIGKILL',
      })
    })
    child.on('error', reject)
  })
}

const runSnippet = R.curry(runSnippetUncurried)

// runSnippets :: Int -> FileN -> Promise(FileResult)
const runSnippets = (timeout, { file, snippets }) => {
  debug('Running snippets from file %o', file)

  // Run snippets sequentially
  return snippets
    .reduce(
      (promise, snippet) =>
        promise.then(results =>
          runSnippet(timeout, snippet).then(result => results.concat(result))
        ),
      Promise.resolve([])
    )
    .then(results => {
      debug('Finished running all snippets')
      return results
    })
    .then(results => ({ file, snippets: results }))
}

module.exports = R.curry(runSnippets)
