# chimi e2e test


```
yarn run e2e
```

To run e2e tests we run `chimi`'s bin on a set of fixture directories (`e2e/fixtures`).

Each directory is run as a different case with it's name as the description.

The fixture has the necessary files to be run and also a `expectations.json` file with the expected status code of the run and the CLI arguments to run `chimi` with.
