var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var appendQuery = require('./url');

var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

var convert = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});

function copyAttributes(src, dest) {
  for (var i = 0, len = src.attributes.length; i < len; i++) {
    var attr = src.attributes[i];
    dest.setAttribute(attr.name, attr.value);
  }
}

function replaceHTML(newHtml) {
  var doc = document.documentElement.cloneNode(true);
  var tmp = document.createElement('div');
  tmp.appendChild(doc);

  var vNewHtml = getVNode(convert(newHtml));
  var vOldHtml = convert(tmp.innerHTML);
  var patches = diff(vOldHtml, vNewHtml);
  document.documentElement.innerHTML = patch(doc, patches).innerHTML;
}

function getVNode(vnode) {
  if (Array.isArray(vnode)) {
    for (var i = 0; i < vnode.length; i++) {
      if (vnode[i] instanceof VNode) {
        return vnode[i];
      }
    }
  }
  return vnode;
}

function reloadScripts() {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0, len = scripts.length; i < len; i++) {
    var oldScript = scripts[i];
    var parent = oldScript.parentNode;
    var newScript = document.createElement('script');
    newScript.src = oldScript.src;
    copyAttributes(oldScript, newScript);
    oldScript.remove();
    parent.appendChild(newScript);
  }
}

module.exports = function(url, query, headers) {
  if (url.indexOf('#') >= 0) return true;

  var requestHeaders = { Accept: 'text/html' };
  if (headers) {
    for (var h in headers) {
      requestHeaders[h] = headers[h];
    }
  }

  // superagent defaulted to sending cookies for same-origin requests and fetch
  // does too, but it is worth being explicit about which one this is.
  fetch(appendQuery(url, query), {
    headers: requestHeaders,
    credentials: 'same-origin'
  })
    .then(function(res) {
      // fetch resolves on 4xx and 5xx; superagent did not. Keep the old
      // behaviour of treating them as failures.
      if (!res.ok) {
        throw new Error('vingle: ' + url + ' responded ' + res.status);
      }
      return res.text();
    })
    .then(function(html) {
      replaceHTML(html);
      window.history.pushState({}, null, url);
      reloadScripts();
    });
  // No catch, deliberately: this used to throw out of superagent's callback as
  // an uncaught error, and an unhandled rejection is the same signal. Attach a
  // window 'unhandledrejection' listener to observe it.

  return false;
};
