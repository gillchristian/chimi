const { stripIndent } = require('common-tags')
const { injectDependencies } = require('../lib/lib')

describe('lib', () => {
  describe('injectDependencies', () => {
    const code = stripIndent`
      const answer = 42

      console.log(answer)
    `

    it('should only add the source maps code when no dependencies are passed', () => {
      const result = injectDependencies({}, code)

      expect(result).toMatchSnapshot()
    })

    it('should not change snippet indentation', () => {
      const withIndentation = stripIndent`
        const foo = {
          bar: "bar"
        };

        Promise.resolve(foo)
          .then(({ bar }) => bar)
          .then(bar => {
            console.log(bar);
          });
      `
      let result = injectDependencies({}, withIndentation)

      expect(result).toMatchSnapshot()

      const dependencies = {
        lodash: '_',
        './lib': 'lib',
      }
      result = injectDependencies(dependencies, withIndentation)

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

    it('should not add a variable declaration when dependencies map values are falsy', () => {
      const dependencies = {
        './for-the-side-effects': false,
        'es6-promise': false,
      }
      const result = injectDependencies(dependencies, code)

      expect(result).toMatchSnapshot()
    })
  })
})
