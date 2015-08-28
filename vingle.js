var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var request = require('superagent');

var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

var convert = require('html-to-vdom')({
  VNode: VNode,
  VText: VText
});

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

module.exports = function(url, query, headers) {
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
  });
};
