const { stripIndent } = require('common-tags')
const { injectDependencies } = require('../lib/lib')

describe('lib', () => {
  describe('injectDependencies', () => {
    const code = stripIndent`
      const answer = 42

      console.log(answer)
    `

    it('should not change the input when no dependencies are passed', () => {
      const dependencies = {}
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })

    it('should prepend requires with variable declarations to the input', () => {
      let dependencies = {
        lodash: '_',
      }
      let result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()

      dependencies = {
        lodash: '_',
        trae: 'trae',
      }
      result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })

    it('should work for local dependencies', () => {
      const dependencies = {
        './lib': 'lib',
        '../foo/bar': 'bar',
      }
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })

    it('should not add a variable declaration when values are falsy', () => {
      const dependencies = {
        './for-the-side-effects': false,
        'es6-promise': false,
      }
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })
  })
})
