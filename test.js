var test = require('node:test');
var assert = require('node:assert');

var appendQuery = require('./url');

/**
 * These expectations are superagent 1.3.0's, captured by running its browser
 * serializer side by side with this one across every case below. They are
 * deliberately not what URLSearchParams would produce -- see url.js.
 */
var cases = [
  ['no query',                '/a', null,              '/a'],
  ['undefined query',         '/a', undefined,         '/a'],
  ['empty object',            '/a', {},                '/a'],
  ['single pair',             '/a', {b: 1},            '/a?b=1'],
  ['space encodes as %20',    '/a', {b: 'x y'},        '/a?b=x%20y'],
  ['separators are escaped',  '/a', {b: 'x&y=z'},      '/a?b=x%26y%3Dz'],
  ['array joins with comma',  '/a', {b: [1, 2]},       '/a?b=1%2C2'],
  ['multiple keys',           '/a', {b: 1, c: 2},      '/a?b=1&c=2'],
  ['existing query string',   '/a?e=1', {b: 2},        '/a?e=1&b=2'],
  ['string query',            '/a', 'b=1',             '/a?b=1'],
  ['string query with ?',     '/a', '?b=1',            '/a?b=1'],
  ['boolean value',           '/a', {b: true},         '/a?b=true'],
  ['zero is kept',            '/a', {b: 0},            '/a?b=0'],
  ['empty string is kept',    '/a', {b: ''},           '/a?b='],
  ['key is encoded',          '/a', {'k e y': 'v'},    '/a?k%20e%20y=v'],
  ['non-ascii',               '/a', {b: 'ünï'},        '/a?b=%C3%BCn%C3%AF'],
  ['undefined value dropped', '/a', {b: undefined},    '/a'],
  ['null value dropped',      '/a', {b: null},         '/a'],
  ['null dropped mid-object', '/a', {a: 1, b: null, c: 2}, '/a?a=1&c=2'],
  ['percent is escaped',      '/a', {b: '100%'},       '/a?b=100%25'],
  ['plus is escaped',         '/a', {b: 'a+b'},        '/a?b=a%2Bb']
];

cases.forEach(function(entry) {
  test('appendQuery: ' + entry[0], function() {
    assert.strictEqual(appendQuery(entry[1], entry[2]), entry[3]);
  });
});

test('appendQuery does not mutate the query object', function() {
  var query = {b: 1, c: null};
  appendQuery('/a', query);
  assert.deepStrictEqual(query, {b: 1, c: null});
});
