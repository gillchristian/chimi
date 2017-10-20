const fs = require('fs')

const R = require('ramda')
const Future = require('fluture')
const { extract } = require('chipa')
const { SourceMapGenerator } = require('source-map')

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

const generateSourceMaps = (code, dependencies) => {
  const decoratedCodeFirstLine =
    1 +
    1 + // require source-map-suppor
    1 + // comment
    dependencies.split('\n').length + // dependencies
    1 // empty line

  const codeLinesCount = code.split('\n').length

  const map = new SourceMapGenerator({
    file: '/decorated-snippet.js',
  })

  for (let i = 0; i < codeLinesCount; i++) {
    map.addMapping({
      generated: {
        line: decoratedCodeFirstLine + i,
        column: 0,
      },
      source: '/snippet.js',
      original: {
        line: i + 1,
        column: 0,
      },
    })
  }

  map.setSourceContent('/snippet.js', code)

  return map.toString()
}

// injectDependencies :: Object -> String -> String
const injectDependencies = (deps, code) => {
  const dependencies = listDependencies(deps || [])
  const sourceMaps = generateSourceMaps(code, dependencies)
  const sourceMapsBase64 = new Buffer(sourceMaps).toString('base64')

  const sourceMapsInline = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${sourceMapsBase64}`

  const generatedCode = [
    "require('source-map-support').install()",
    '// snippet dependencies',
    dependencies,
    '',
    code,
    sourceMapsInline,
  ].join('\n')

  return generatedCode
}

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
