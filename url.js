/**
 *  Appends a query to a url.
 *
 *  Extracted so it can be tested without a DOM. superagent used to do this via
 *  `.query()`, and this reproduces its browser serializer exactly rather than
 *  reaching for URLSearchParams, which differs in three ways that would all
 *  have been silent:
 *
 *    - an array value is coerced to a string, so `{a: [1, 2]}` is `a=1%2C2`,
 *      not the repeated `a=1&a=2` that URLSearchParams would produce
 *    - null and undefined values are dropped, rather than serialized as
 *      "null" and "undefined"
 *    - encodeURIComponent renders a space as %20, where URLSearchParams uses +
 *
 *  @param {Object|String=} query - a parameter object, or a pre-built string
 *  @return {String}
 */
function appendQuery(url, query) {
  if (!query) return url;

  var serialized;

  if (typeof query === 'string') {
    // superagent pushed a string through untouched, so `query('?a=1')` produced
    // a url with two question marks in it. Stripping the leading separator is
    // the one intentional difference here.
    serialized = query.replace(/^[?&]/, '');
  } else {
    var pairs = [];
    // for-in rather than Object.keys, again matching superagent: inherited
    // enumerable properties were included.
    for (var key in query) {
      if (query[key] != null) {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(query[key]));
      }
    }
    serialized = pairs.join('&');
  }

  if (!serialized) return url;
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + serialized;
}

module.exports = appendQuery;
