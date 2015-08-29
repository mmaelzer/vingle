var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var request = require('superagent');

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
  var req = request.get(url).set('Accept', 'text/html');
  if (query) req.query(query);
  if (headers) {
    for (var h in headers) {
      req.set(h, headers[h]);  
    }
  }
  req.end(function(err, res) {
    if (err) throw new Error(err);
    replaceHTML(res.text);
    window.history.pushState({}, null, url);
    reloadScripts();
  });
  return false;
};
