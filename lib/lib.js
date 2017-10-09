const fs = require('fs')

const R = require('ramda')
const Future = require('fluture')
const { extract } = require('chipa')

// sanctuary with Fluture types added
const S = require('./sanctuary')
const { readFile, taskify } = require('./utils')
const runSnippets = require('./run-snippet')

// requireWithAssignment :: String -> String -> String
const requireWithAssignment = (path, name) => `let ${name} = require('${path}')`

// simpleRequire :: String -> String
const simpleRequire = path => `require('${path}')`

// buildRequireExpression :: String -> String -> String
const buildRequireExpression = R.ifElse(
  (_, value) => Boolean(value),
  requireWithAssignment,
  simpleRequire
)

// listDependencies :: Object -> String
const listDependencies = deps =>
  Object.keys(deps)
    .map(key => buildRequireExpression(key, deps[key]))
    .map(r => r + ';')
    .join('\n')

// injectDependencies :: Object -> String -> String
const injectDependencies = (deps, code) =>
  !deps || R.isEmpty(deps)
    ? code
    : ['// snippet dependencies', listDependencies(deps), code].join('\n')

// SnippetData :: { value: String, meta: String, ... }
// Snippet     :: { value: String, meta: String, id: Int }
// File  :: { file: String, snippets: [SnippetData], ... }
// FileN :: { file: String, snippets: [Snippet] }

// traverseFiles :: Int -> [FileN] -> Future([FileResult])
const traverseFiles = timeout => snippets =>
  S.traverse(Future, runSnippets(timeout), snippets)

const mapWithIndex = R.addIndex(S.map)

// normalizeSnippets :: Object -> [SnippetData] -> [Snippet]
const normalizeSnippets = deps =>
  mapWithIndex(({ value, meta }, id) => ({
    value: injectDependencies(deps, value),
    meta,
    id,
  }))

// normalizeFiles :: Object -> [File] -> [FileN]
const normalizeFiles = deps =>
  S.map(
    S.compose(R.evolve({ snippets: normalizeSnippets(deps) }), R.omit(['lang']))
  )

// matches "(skip)"with any amount of spaces between the whitespace
const skipRegex = /\(\s*skip\s*\)/

// matchNoSkip :: Snippet -> Bool
const matchNoSkip = S.compose(S.complement(S.test(skipRegex)), S.prop('meta'))

// skips snippets with `(skip)` in their metadata
//
// skip :: [File] -> [File]
const skip = S.map(R.evolve({ snippets: S.filter(matchNoSkip) }))

// GlobPattern :: String
// @link: https://github.com/isaacs/node-glob#glob-primer

// taskOfSnippets :: Object -> Int -> GlobPattern -> Future([FileResult])
const taskOfSnippets = (dependencies, timeout, glob) =>
  S.pipe(
    [
      S.map(skip),
      S.map(normalizeFiles(dependencies)),
      S.chain(traverseFiles(timeout)),
    ],
    taskify(extract)(glob, ['js', 'javascript'])
  )

module.exports = {
  injectDependencies,
  taskOfSnippets,
}
