# newrelic-async-listener-broken-es6-promise
Demo script showing an instrumentation conflict between newrelic and async-listener modules w.r.t. instrumentation wrapping ES6 promises

# To Run:
Reproducible running node 12 with the --harmony flag.

To run demo:

```sh
# installs newrelic and async-listener (commonly brought in via continuation-local-storage)
npm install 

node --harmony index.js
```

One gets a stack trace like so:

```
/Users/dlopuch/newrelic-async-listener-broken-es6-promise/node_modules/newrelic/lib/instrumentation/core/globals.js:43
        return Promise(executor)
               ^
TypeError: undefined is not a promise
    at new wrappedPromise (/Users/dlopuch/newrelic-async-listener-broken-es6-promise/node_modules/newrelic/lib/instrumentation/core/globals.js:43:16)
    at new wrappedPromise (/Users/dlopuch/newrelic-async-listener-broken-es6-promise/node_modules/async-listener/index.js:263:19)
    at Object.<anonymous> (/Users/dlopuch/newrelic-async-listener-broken-es6-promise/index.js:14:9)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```



# Technical
newrelic used to bring in continuation-local-storage, which relies on async-listener to do its magic.

async-listener adds instrumentation around the `Promise` global (`async-listener/index.js:236`).

It seems that newrelic stopped requiring CLS (and therefore AL) sometime since 0.13 and instead just incorporated a variant of the instrumentation wrapper at `newrelic/lib/instrumentation/core/globals.js:40`.  The first check:

```javascript
      if (!(this instanceof global.Promise)) {
        /*eslint-disable new-cap*/
        return Promise(executor)
        /*eslint-enable new-cap*/
      }
```

(which is what AL does as well) is what gets confused and seems to invoke the (wrapped) promise incorrectly when constructing a new promise.  It appears that the two wrappings confuse the instanceof check and end up doing the wrong thing.
