# chimi example

this is an example project using `chimi` to test Markdown snippets

## snippets


```javascript
```


```js
const foo = {
  bar: 'bar'
}

console.log(foo)
```

### With dependencies

The dependences are defined in `.chimirc` and chimi requires them when running the snippet.
You can require them yourself, but is a handy way to omit requiring a dependency in every snippet.

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

### Timeout

This snippet will not finish running. _The default timeout is 5s_.

```js
setTimeout(() => {
  console.log('I will never run')
},10 * 1000)

