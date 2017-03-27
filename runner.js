const fs        = require('fs')
const isolated  = require('require-from-string')
const R         = require('ramda')
const Task      = require('data.task')

const { read } = require('./lib')
const pkg      = require('./package.json')

const file = 'readme.md'

// This regex matches:
//   ```(?:js|javascript): start of snippet with non-capturing group
//   ([\s\S]+?): snippet code in captrouring group with non-greedy wildcard
//   ```: end of snippet
const snippetMatcher = /```(?:js|javascript)([\s\S]+?)```/g

// dependency :: String -> String|{path: String} -> String
const dependency = (dep, path) => typeof path === 'string'
  ? `let ${dep} = require('${path}')`
  : `require('${path.path}')`

// dependencies :: Object -> String
const dependencies = (deps) => Object
  .keys(deps)
  .reduce((acc, key) => `${acc}; ${dependency(key, deps[key])}`, '')

// doEval :: String -> Int -> Task
const doEval = (code, i) => isolated(`
  // snippet dependencies
  ${dependencies(pkg.sarasa.dependencies)}

  function snippet() {

    console.log('----- Running snippet #' + ${i} + '-----')

    return new Promise((res, rej) => {
      try {
        const result = eval(\`${code}\`)
        res(result)
      } catch(e) {
        rej(e)
      }
    })
  }
  module.exports = snippet
`)()


// snippetTask :: String -> Int -> Task(Error, a)
const snippetTask = (code, i) =>
  new Task((rej, res) => doEval(code, i).then(res).catch(rej))

const count = { success: 0, reject: 0 }
const notFoundMsg = `\nNo JS snippets found ${file}.  ¯\\_(ツ)_/¯`

const extractSnippets = file => {
  const snippets = []

  let match = null
  while (match = snippetMatcher.exec(file)) {
    snippets.push(match[1])
  }

  return snippets
}

read(file)
  .map(extractSnippets)
  .map(R.map(snippetTask))
  .map(tasks => {

    tasks.map(t => {
      t.fork(
        (e) => {
          console.log('----- error -----')
          console.log(e)
          count.reject = count.reject + 1
        },
        (arg) => {
          console.log('----- success -----')
          console.log(arg)
          count.success = count.success + 1
        }
      )
      return t
    })

    return Object.assign(count, { snippetsRun: tasks.length })
  })
  .fork(
    () => { console.log(notFoundMsg) },
    (result) => {
      console.log(`\nRun ${result.snippetsRun} snippets.`)
      console.log(`  Succeded: ${result.success}`)
      console.log(`  Rejected: ${result.reject}`)
    }
  )

