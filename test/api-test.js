var request = require('request');
var assert = require('assert');
const env = Object.assign({}, process.env);
var app = null;
var host = process.env.url || 'localhost';
var port = process.env.port || '80';
var url = `http://${host}:${port}`;

// eslint-disable-next-line
before(() => {
  process.env.verbose='false';
  // eslint-disable-next-line global-require
  app = require('../app.js');
  console.log(`Testing server started at ${url}\n`);
});

// eslint-disable-next-line
after(() => {
    process.env = env;
    app.stop();
    console.log('Testing server stopped.');
});

var testUrl = `${url}/api/template/`;
describe(`A good request to ${testUrl}`, () => {
  it('should return 200', (done) => {
    request
      .get(testUrl)
      .on('response', (res) => {
          assert.equal(res.statusCode, 200);
          done();
      })
      .on('error', (err) => {
        assert.fail(err.message);
        done();
      })
  });
});
