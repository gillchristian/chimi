const R = require('ramda')
const { extract } = require('chipa')

// sanctuary with Fluture types added
const S = require('./sanctuary')

const { processSnippet } = require('./process-snippet')

// SnippetData :: { value: String, meta: String, ... }
// Snippet     :: { value: String, meta: String, id: Int }
// File  :: { file: String, snippets: [SnippetData], ... }
// FileN :: { file: String, snippets: [Snippet] }

const mapWithIndex = R.addIndex(S.map)

// normalizeSnippets :: Object -> Object -> [SnippetData] -> [Snippet]
const normalizeSnippets = (file, deps, globals) =>
  mapWithIndex(({ value, meta, position }, index) => ({
    id: index,
    value: processSnippet(file, value, position, deps, globals),
    meta,
  }))

// normalizeFiles :: Object -> Object -> [File] -> [FileN]
const normalizeFiles = (deps, globals) =>
  S.map(({ file, snippets }) => ({
    file,
    snippets: normalizeSnippets(file, deps, globals)(snippets),
  }))

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

// extractSnippets :: Object -> Object -> Int -> GlobPattern -> Promise([FileN])
const extractSnippets = ({ dependencies, globals }, glob) =>
  extract(glob, ['js', 'javascript'])
    .then(skip)
    .then(normalizeFiles(dependencies, globals))

module.exports = {
  extractSnippets,
}
