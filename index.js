if (!process.execArgv[0] || process.execArgv[0] !== '--harmony') {
  console.log('run this demo with node 0.12 using the --harmony flag.');
  process.exit(1);
}

process.env.NEW_RELIC_ENABLED='1';
var newrelic = require('newrelic');

var al = require('async-listener');

console.log('\n\n----------About to test newrelic / async-listener conflict...');

// This line creates an error if BOTH newrelic and async-listener are included.
var p = new Promise(function() {});
Promise.resolve(p);

console.log('Test finished successfully.  Problem fixed!');
process.exit(0);
