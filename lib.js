const fs           = require('fs')
const R            = require('ramda')
const isolated     = require('require-from-string')
const Task         = require('data.task')
const { List }     = require('immutable-ext')

const { readFile } = require('./utils')
const config       = require('./config')

// This regex matches:
//   ```(?:js|javascript): start of snippet with non-capturing group
//   ([\s\S]+?): snippet code in captrouring group with non-greedy wildcard
//   ```: end of snippet
const snippetMatcher = /```(?:js|javascript)([\s\S]+?)```/g

// extractSnippets :: String -> [String]
const extractSnippets = file => {
  const snippets = []

  let match = null
  while (match = snippetMatcher.exec(file)) {
    snippets.push(match[1])
  }

  return snippets
}

// buildRequireExpression :: String -> String|{path: String} -> String
const buildRequireExpression = (dep, path) => typeof path === 'string'
  ? `let ${dep} = require('${path}')`
  : `require('${path.path}')`

// listDependencies :: Object -> String
const listDependencies = (deps) => Object
  .keys(deps)
  .map(key => buildRequireExpression(key, deps[key]))
  .map(r => r + ';')
  .join('\n')

// runSnippet :: String -> Int -> Task
const runSnippet = (code) => isolated(`
  // snippet dependencies
  ${listDependencies(config.dependencies || [])}

  function snippet() {
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

// snippetTask :: {code: String, id: Int} -> Task(Error, a)
const snippetTask = ({code, id}) =>
  new Task(
    (reject, resolve) => {
      let finished = false

      const t = setTimeout(() => {
        if (!finished) {
          finished = true
          resolve({error: new Error('Timeout'), ok: false, id})
        }
      }, config.timeout * 1000)

      runSnippet(code)
        .then(value => {
          if (!finished) {
            finished = true
            clearTimeout(t)
            resolve({value, ok: true, id})
          }
        })
        .catch(error => {
          if (!finished) {
            finished = true
            clearTimeout(t)
            resolve({error, ok: false, id})
          }
        })
    }
  )

// traverseSnippets :: List(Task) -> Task(List)
const traverseSnippets = snippets => snippets.traverse(Task.of, snippetTask)

// FileName :: String

// taskOfSnippets :: FileName -> Task(List)
const taskOfSnippets = file =>  readFile(file)
  .map(extractSnippets)
  .map(snippets => snippets.map((snippet, i) => ({code: snippet, id: i})))
  .map(List)
  .chain(traverseSnippets)

module.exports = { taskOfSnippets }

