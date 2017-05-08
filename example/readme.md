# chimi example

this is an example project using `chimi` to test Markdown snippets

## run example

`chimi` uses a config file, by default it will look for `.chimirc` but you can indicate other file.

```bash
$ npm test                       # uses .chimirc
$ npm test -- -c chimi.json      # uses chimi.json
$ npm test -- -c chimi.config.js # uses exported object from chimi.config.js
$ npm test -- -c package.json    # uses the property "chimi" from package.json
```


## snippets

```javascript
console.log(1)
```


```js
const foo = {
  bar: 'bar'
}

console.log(foo)
```

Using a local dependency (from `math.js`)
```js
add(1, 2)
```

Using a third party dependency (from `npm`)
```javascript
trae.baseUrl('http://swapi.co/api/')

trae.after(r => r.data)

trae.get('people/1')
  .then(data => console.log(data))
```

