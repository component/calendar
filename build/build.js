
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-clone/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var type;\n\
try {\n\
  type = require('component-type');\n\
} catch (_) {\n\
  type = require('type');\n\
}\n\
\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = clone;\n\
\n\
/**\n\
 * Clones objects.\n\
 *\n\
 * @param {Mixed} any object\n\
 * @api public\n\
 */\n\
\n\
function clone(obj){\n\
  switch (type(obj)) {\n\
    case 'object':\n\
      var copy = {};\n\
      for (var key in obj) {\n\
        if (obj.hasOwnProperty(key)) {\n\
          copy[key] = clone(obj[key]);\n\
        }\n\
      }\n\
      return copy;\n\
\n\
    case 'array':\n\
      var copy = new Array(obj.length);\n\
      for (var i = 0, l = obj.length; i < l; i++) {\n\
        copy[i] = clone(obj[i]);\n\
      }\n\
      return copy;\n\
\n\
    case 'regexp':\n\
      // from millermedeiros/amd-utils - MIT\n\
      var flags = '';\n\
      flags += obj.multiline ? 'm' : '';\n\
      flags += obj.global ? 'g' : '';\n\
      flags += obj.ignoreCase ? 'i' : '';\n\
      return new RegExp(obj.source, flags);\n\
\n\
    case 'date':\n\
      return new Date(obj.getTime());\n\
\n\
    default: // string, number, boolean, …\n\
      return obj;\n\
  }\n\
}\n\
//@ sourceURL=component-clone/index.js"
));
require.register("code42day-bounds/index.js", Function("exports, require, module",
"var clone;\n\
\n\
if ('undefined' == typeof window) {\n\
  clone = require('clone-component');\n\
} else {\n\
  clone = require('clone');\n\
}\n\
\n\
module.exports = Bounds;\n\
\n\
\n\
function calculateReversed(self) {\n\
  return self._min\n\
    && self._max\n\
    && self.before(self._max);\n\
}\n\
\n\
function Bounds(obj) {\n\
  if (obj) return mixin(obj);\n\
}\n\
\n\
function mixin(obj) {\n\
  for (var key in Bounds.prototype) {\n\
    obj[key] = Bounds.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
Bounds.prototype.compare = function(fn) {\n\
  this._compare = fn;\n\
  return this;\n\
};\n\
\n\
Bounds.prototype.distance = function(fn) {\n\
  this._distance = fn;\n\
  return this;\n\
};\n\
\n\
Bounds.prototype.min = function(v) {\n\
  if (!arguments.length) {\n\
    return this._min;\n\
  }\n\
  this._min = v;\n\
  delete this._reversed;\n\
  return this;\n\
};\n\
\n\
Bounds.prototype.max = function(v) {\n\
  if (!arguments.length) {\n\
    return this._max;\n\
  }\n\
  this._max = v;\n\
  delete this._reversed;\n\
  return this;\n\
};\n\
\n\
Bounds.prototype.before = function(v) {\n\
  return this._min && (this._compare(v, this._min) < 0);\n\
};\n\
\n\
Bounds.prototype.after = function(v) {\n\
  return this._max && (this._compare(v, this._max) > 0);\n\
};\n\
\n\
Bounds.prototype.out = function(v) {\n\
  return this.before(v) || this.after(v);\n\
};\n\
\n\
Bounds.prototype.in = function(v) {\n\
  return !this.out(v);\n\
};\n\
\n\
Bounds.prototype.valid = function(v) {\n\
  if (this.reversed()) {\n\
    return !this.after(v) || !this.before(v);\n\
  }\n\
  return this.in(v);\n\
};\n\
\n\
Bounds.prototype.invalid = function(v) {\n\
  return !this.valid(v);\n\
};\n\
\n\
Bounds.prototype.reversed = function() {\n\
  if (this._reversed === undefined) {\n\
    this._reversed = calculateReversed(this);\n\
  }\n\
  return this._reversed;\n\
};\n\
\n\
Bounds.prototype.restrict = function(v) {\n\
  if (this.reversed()) {\n\
    if(this.after(v) && this.before(v)) {\n\
      // select closer bound\n\
      return (this._distance(this._max, v) < this._distance(v, this._min))\n\
        ? clone(this._max)\n\
        : clone(this._min);\n\
    }\n\
    return v;\n\
  }\n\
  if(this.before(v)) {\n\
    return clone(this._min);\n\
  }\n\
  if(this.after(v)) {\n\
    return clone(this._max);\n\
  }\n\
  return v;\n\
};\n\
//@ sourceURL=code42day-bounds/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
  \n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`, can force state via `force`.\n\
 *\n\
 * For browsers that support classList, but do not support `force` yet,\n\
 * the mistake will be detected and corrected.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} force\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name, force){\n\
  // classList\n\
  if (this.list) {\n\
    if (\"undefined\" !== typeof force) {\n\
      if (force !== this.list.toggle(name, force)) {\n\
        this.list.toggle(name); // toggle again to correct\n\
      }\n\
    } else {\n\
      this.list.toggle(name);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (\"undefined\" !== typeof force) {\n\
    if (!force) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  } else {\n\
    if (this.has(name)) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
    prefix = bind !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  el[bind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  el[unbind](prefix + type, fn, capture || false);\n\
  return fn;\n\
};//@ sourceURL=component-event/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"/**\n\
 * Global Names\n\
 */\n\
\n\
var globals = /\\b(this|Array|Date|Object|Math|JSON)\\b/g;\n\
\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String|Function} map function or prefix\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, fn){\n\
  var p = unique(props(str));\n\
  if (fn && 'string' == typeof fn) fn = prefixed(fn);\n\
  if (fn) return map(str, p, fn);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .replace(globals, '')\n\
    .match(/[$a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` mapped with `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function map(str, props, fn) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return fn(_);\n\
    if (!~props.indexOf(_)) return _;\n\
    return fn(_);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Map with prefix `str`.\n\
 */\n\
\n\
function prefixed(str) {\n\
  return function(_){\n\
    return str + _;\n\
  };\n\
}\n\
//@ sourceURL=component-props/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"/**\n\
 * Module Dependencies\n\
 */\n\
try {\n\
  var expr = require('props');\n\
} catch(e) {\n\
  var expr = require('component-props');\n\
}\n\
\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\" or \"age > 18 && age < 36\"\n\
  return new Function('_', 'return ' + get(str));\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
\n\
/**\n\
 * Built the getter function. Supports getter style functions\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function get(str) {\n\
  var props = expr(str);\n\
  if (!props.length) return '_.' + str;\n\
\n\
  var val;\n\
  for(var i = 0, prop; prop = props[i]; i++) {\n\
    val = '_.' + prop;\n\
    val = \"('function' == typeof \" + val + \" ? \" + val + \"() : \" + val + \")\";\n\
    str = str.replace(new RegExp(prop, 'g'), val);\n\
  }\n\
\n\
  return str;\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-map/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
\n\
/**\n\
 * Map the given `arr` with callback `fn(val, i)`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(arr, fn){\n\
  var ret = [];\n\
  fn = toFunction(fn);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    ret.push(fn(arr[i], i));\n\
  }\n\
  return ret;\n\
};//@ sourceURL=component-map/index.js"
));
require.register("component-range/index.js", Function("exports, require, module",
"\n\
module.exports = function(from, to, inclusive){\n\
  var ret = [];\n\
  if (inclusive) to++;\n\
\n\
  for (var n = from; n < to; ++n) {\n\
    ret.push(n);\n\
  }\n\
\n\
  return ret;\n\
}//@ sourceURL=component-range/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = callbacks.indexOf(fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-in-groups-of/index.js", Function("exports, require, module",
"\n\
module.exports = function(arr, n){\n\
  var ret = [];\n\
  var group = [];\n\
  var len = arr.length;\n\
  var per = len * (n / len);\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    group.push(arr[i]);\n\
    if ((i + 1) % n == 0) {\n\
      ret.push(group);\n\
      group = [];\n\
    }\n\
  }\n\
\n\
  if (group.length) ret.push(group);\n\
\n\
  return ret;\n\
};//@ sourceURL=component-in-groups-of/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object Error]': return 'error';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val !== val) return 'nan';\n\
  if (val && val.nodeType === 1) return 'element';\n\
\n\
  return typeof val.valueOf();\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("yields-empty/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Empty the given `el`.\n\
 * \n\
 * @param {Element} el\n\
 * @return {Element}\n\
 */\n\
\n\
module.exports = function(el, node){\n\
  while (node = el.firstChild) el.removeChild(node);\n\
  return el;\n\
};\n\
//@ sourceURL=yields-empty/index.js"
));
require.register("stephenmathieson-normalize/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Normalize the events provided to `fn`\n\
 *\n\
 * @api public\n\
 * @param {Function|Event} fn\n\
 * @return {Function|Event}\n\
 */\n\
\n\
exports = module.exports = function (fn) {\n\
  // handle functions which are passed an event\n\
  if (typeof fn === 'function') {\n\
    return function (event) {\n\
      event = exports.normalize(event);\n\
      fn.call(this, event);\n\
    };\n\
  }\n\
\n\
  // just normalize the event\n\
  return exports.normalize(fn);\n\
};\n\
\n\
/**\n\
 * Normalize the given `event`\n\
 *\n\
 * @api private\n\
 * @param {Event} event\n\
 * @return {Event}\n\
 */\n\
\n\
exports.normalize = function (event) {\n\
  event = event || window.event;\n\
\n\
  event.target = event.target || event.srcElement;\n\
\n\
  event.which = event.which ||  event.keyCode || event.charCode;\n\
\n\
  event.preventDefault = event.preventDefault || function () {\n\
    this.returnValue = false;\n\
  };\n\
\n\
  event.stopPropagation = event.stopPropagation || function () {\n\
    this.cancelBubble = true;\n\
  };\n\
\n\
  return event;\n\
};\n\
//@ sourceURL=stephenmathieson-normalize/index.js"
));

require.register("calendar/index.js", Function("exports, require, module",
"\n\
module.exports = require('./lib/calendar');//@ sourceURL=calendar/index.js"
));
require.register("calendar/lib/utils.js", Function("exports, require, module",
"\n\
/**\n\
 * Clamp `month`.\n\
 *\n\
 * @param {Number} month\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
exports.clamp = function(month){\n\
  if (month > 11) return 0;\n\
  if (month < 0) return 11;\n\
  return month;\n\
};\n\
//@ sourceURL=calendar/lib/utils.js"
));
require.register("calendar/lib/template.js", Function("exports, require, module",
"module.exports = '<table class=\"calendar-table\">\\n\
  <thead>\\n\
    <tr>\\n\
      <td class=\"prev\"><a href=\"#\">←</a></td>\\n\
      <td colspan=\"5\" class=\"title\"><span class=\"month\"></span> <span class=\"year\"></span></td>\\n\
      <td class=\"next\"><a href=\"#\">→</a></td>\\n\
    </tr>\\n\
  </thead>\\n\
  <tbody>\\n\
  </tbody>\\n\
</table>';//@ sourceURL=calendar/lib/template.js"
));
require.register("calendar/lib/calendar.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var bind = require('bind')\n\
  , domify = require('domify')\n\
  , Emitter = require('emitter')\n\
  , classes = require('classes')\n\
  , template = require('./template')\n\
  , Days = require('./days')\n\
  , clamp = require('./utils').clamp;\n\
\n\
/**\n\
 * Expose `Calendar`.\n\
 */\n\
\n\
module.exports = Calendar;\n\
\n\
/**\n\
 * Initialize a new `Calendar`\n\
 * with the given `date` defaulting\n\
 * to now.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `prev` when the prev link is clicked\n\
 *  - `next` when the next link is clicked\n\
 *  - `change` (date) when the selected date is modified\n\
 *\n\
 * @params {Date} date\n\
 * @api public\n\
 */\n\
\n\
function Calendar(date) {\n\
  if (!(this instanceof Calendar)) {\n\
    return new Calendar(date);\n\
  }\n\
\n\
  Emitter.call(this);\n\
  var self = this;\n\
  this.el = domify('<div class=calendar></div>');\n\
  this.days = new Days;\n\
  this.el.appendChild(this.days.el);\n\
  this.on('change', bind(this, this.show));\n\
  this.days.on('prev', bind(this, this.prev));\n\
  this.days.on('next', bind(this, this.next));\n\
  this.days.on('year', bind(this, this.menuChange, 'year'));\n\
  this.days.on('month', bind(this, this.menuChange, 'month'));\n\
  this.show(date || new Date);\n\
  this.days.on('change', function(date){\n\
    self.emit('change', date);\n\
  });\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Calendar.prototype);\n\
\n\
/**\n\
 * Add class `name` to differentiate this\n\
 * specific calendar for styling purposes,\n\
 * for example `calendar.addClass('date-picker')`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.addClass = function(name){\n\
  classes(this.el).add(name);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Select `date`.\n\
 *\n\
 * @param {Date} date\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.select = function(date){\n\
  if (this.days.validRange.valid(date)) {\n\
    this.selected = date;\n\
    this.days.select(date);\n\
  }\n\
  this.show(date);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show `date`.\n\
 *\n\
 * @param {Date} date\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.show = function(date){\n\
  this._date = date;\n\
  this.days.show(date);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set minimum valid date (inclusive)\n\
 *\n\
 * @param {Date} date\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.min = function(date) {\n\
  this.days.validRange.min(date);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Set maximum valid date (inclusive)\n\
 *\n\
 * @param {Date} date\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.max = function(date) {\n\
  this.days.validRange.max(date);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Enable a year dropdown.\n\
 *\n\
 * @param {Number} from\n\
 * @param {Number} to\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.showYearSelect = function(from, to){\n\
  from = from || this._date.getFullYear() - 10;\n\
  to = to || this._date.getFullYear() + 10;\n\
  this.days.yearMenu(from, to);\n\
  this.show(this._date);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Enable a month dropdown.\n\
 *\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.showMonthSelect = function(){\n\
  this.days.monthMenu();\n\
  this.show(this._date);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return the previous month.\n\
 *\n\
 * @return {Date}\n\
 * @api private\n\
 */\n\
\n\
Calendar.prototype.prevMonth = function(){\n\
  var date = new Date(this._date);\n\
  date.setDate(1);\n\
  date.setMonth(date.getMonth() - 1);\n\
  return date;\n\
};\n\
\n\
/**\n\
 * Return the next month.\n\
 *\n\
 * @return {Date}\n\
 * @api private\n\
 */\n\
\n\
Calendar.prototype.nextMonth = function(){\n\
  var date = new Date(this._date);\n\
  date.setDate(1);\n\
  date.setMonth(date.getMonth() + 1);\n\
  return date;\n\
};\n\
\n\
/**\n\
 * Show the prev view.\n\
 *\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.prev = function(){\n\
  this.show(this.prevMonth());\n\
  this.emit('view change', this.days.selectedMonth(), 'prev');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the next view.\n\
 *\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.next = function(){\n\
  this.show(this.nextMonth());\n\
  this.emit('view change', this.days.selectedMonth(), 'next');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Switch to the year or month selected by dropdown menu.\n\
 *\n\
 * @return {Calendar}\n\
 * @api public\n\
 */\n\
\n\
Calendar.prototype.menuChange = function(action){\n\
  var date = this.days.selectedMonth();\n\
  this.show(date);\n\
  this.emit('view change', date, action);\n\
  return this;\n\
};\n\
//@ sourceURL=calendar/lib/calendar.js"
));
require.register("calendar/lib/dayrange.js", Function("exports, require, module",
"var Bounds = require('bounds');\n\
\n\
var type;\n\
\n\
if (typeof window !== 'undefined') {\n\
  type = require('type');\n\
} else {\n\
  type = require('type-component');\n\
}\n\
\n\
module.exports = DayRange;\n\
\n\
function date(d) {\n\
  return type(d) === 'date' ? d : new Date(d[0], d[1], d[2]);\n\
}\n\
\n\
function DayRange(min, max) {\n\
  return this.min(min).max(max);\n\
}\n\
\n\
Bounds(DayRange.prototype);\n\
\n\
DayRange.prototype._compare = function(a, b) {\n\
  return date(a).getTime() - date(b).getTime();\n\
}\n\
\n\
DayRange.prototype._distance = function(a, b) {\n\
  return Math.abs(this.compare(a, b));\n\
}\n\
//@ sourceURL=calendar/lib/dayrange.js"
));
require.register("calendar/lib/days.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var domify = require('domify')\n\
  , Emitter = require('emitter')\n\
  , classes = require('classes')\n\
  , events = require('event')\n\
  , map = require('map')\n\
  , template = require('./template')\n\
  , inGroupsOf = require('in-groups-of')\n\
  , clamp = require('./utils').clamp\n\
  , range = require('range')\n\
  , empty = require('empty')\n\
  , normalize = require('normalize')\n\
  , DayRange = require('./dayrange');\n\
\n\
/**\n\
 * Days.\n\
 */\n\
\n\
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];\n\
\n\
/**\n\
 * Months.\n\
 */\n\
\n\
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];\n\
\n\
/**\n\
 * Get days in `month` for `year`.\n\
 *\n\
 * @param {Number} month\n\
 * @param {Number} year\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function daysInMonth(month, year) {\n\
  return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];\n\
}\n\
\n\
/**\n\
 * Check if `year` is a leap year.\n\
 *\n\
 * @param {Number} year\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isLeapYear(year) {\n\
  return (0 == year % 400)\n\
    || ((0 == year % 4) && (0 != year % 100))\n\
    || (0 == year);\n\
}\n\
\n\
\n\
/**\n\
 * Expose `Days`.\n\
 */\n\
\n\
module.exports = Days;\n\
\n\
/**\n\
 * Initialize a new `Days` view.\n\
 *\n\
 * Emits:\n\
 *\n\
 *   - `prev` when prev link is clicked\n\
 *   - `next` when next link is clicked\n\
 *   - `change` (date) when a date is selected\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Days() {\n\
  Emitter.call(this);\n\
  var self = this;\n\
  this.el = domify(template);\n\
  classes(this.el).add('calendar-days');\n\
  this.head = this.el.tHead;\n\
  this.body = this.el.tBodies[0];\n\
  this.title = this.head.querySelector('.title');\n\
  this.select(new Date);\n\
  this.validRange = new DayRange;\n\
\n\
  // emit \"day\"\n\
  events.bind(this.body, 'click', normalize(function(e){\n\
    if (e.target.tagName !== 'A') {\n\
      return true;\n\
    }\n\
\n\
    e.preventDefault();\n\
\n\
    var el = e.target;\n\
    var data = el.getAttribute('data-date').split('-');\n\
    if (!self.validRange.valid(data)) {\n\
      return false;\n\
    }\n\
    var year = data[0];\n\
    var month = data[1];\n\
    var day = data[2];\n\
    var date = new Date(year, month, day);\n\
    self.select(date);\n\
    self.emit('change', date);\n\
    return false;\n\
  }));\n\
\n\
  // emit \"prev\"\n\
  events.bind(this.el.querySelector('.prev'), 'click', normalize(function(ev){\n\
    ev.preventDefault();\n\
\n\
    self.emit('prev');\n\
    return false;\n\
  }));\n\
\n\
  // emit \"next\"\n\
  events.bind(this.el.querySelector('.next'), 'click', normalize(function(ev){\n\
    ev.preventDefault();\n\
\n\
    self.emit('next');\n\
    return false;\n\
  }));\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Days.prototype);\n\
\n\
/**\n\
 * Select the given `date`.\n\
 *\n\
 * @param {Date} date\n\
 * @return {Days}\n\
 * @api public\n\
 */\n\
\n\
Days.prototype.select = function(date){\n\
  this.selected = date;\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Show date selection.\n\
 *\n\
 * @param {Date} date\n\
 * @api public\n\
 */\n\
\n\
Days.prototype.show = function(date){\n\
  var year = date.getFullYear();\n\
  var month = date.getMonth();\n\
  this.showSelectedYear(year);\n\
  this.showSelectedMonth(month);\n\
  var subhead = this.head.querySelector('.subheading');\n\
  if (subhead) {\n\
    subhead.parentElement.removeChild(subhead);\n\
  }\n\
\n\
  this.head.appendChild(this.renderHeading(2));\n\
  empty(this.body);\n\
  this.body.appendChild(this.renderDays(date));\n\
};\n\
\n\
/**\n\
 * Enable a year dropdown.\n\
 *\n\
 * @param {Number} from\n\
 * @param {Number} to\n\
 * @api public\n\
 */\n\
\n\
Days.prototype.yearMenu = function(from, to){\n\
  this.selectYear = true;\n\
  this.title.querySelector('.year').innerHTML = yearDropdown(from, to);\n\
  var self = this;\n\
  events.bind(this.title.querySelector('.year .calendar-select'), 'change', function(){\n\
    self.emit('year');\n\
    return false;\n\
  });\n\
};\n\
\n\
/**\n\
 * Enable a month dropdown.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Days.prototype.monthMenu = function(){\n\
  this.selectMonth = true;\n\
  this.title.querySelector('.month').innerHTML = monthDropdown();\n\
  var self = this;\n\
  events.bind(this.title.querySelector('.month .calendar-select'), 'change', function(){\n\
    self.emit('month');\n\
    return false;\n\
  });\n\
};\n\
\n\
/**\n\
 * Return current year of view from title.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.titleYear = function(){\n\
  if (this.selectYear) {\n\
    return this.title.querySelector('.year .calendar-select').value;\n\
  } else {\n\
    return this.title.querySelector('.year').innerHTML;\n\
  }\n\
};\n\
\n\
/**\n\
 * Return current month of view from title.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.titleMonth = function(){\n\
  if (this.selectMonth) {\n\
    return this.title.querySelector('.month .calendar-select').value;\n\
  } else {\n\
    return this.title.querySelector('.month').innerHTML;\n\
  }\n\
};\n\
\n\
/**\n\
 * Return a date based on the field-selected month.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Days.prototype.selectedMonth = function(){\n\
  return new Date(this.titleYear(), this.titleMonth(), 1);\n\
};\n\
\n\
/**\n\
 * Render days of the week heading with\n\
 * the given `length`, for example 2 for \"Tu\",\n\
 * 3 for \"Tue\" etc.\n\
 *\n\
 * @param {String} len\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.renderHeading = function(len){\n\
  var rows = '<tr class=subheading>' + map(days, function(day){\n\
    return '<th>' + day.slice(0, len) + '</th>';\n\
  }).join('') + '</tr>';\n\
  return domify(rows);\n\
};\n\
\n\
/**\n\
 * Render days for `date`.\n\
 *\n\
 * @param {Date} date\n\
 * @return {Element}\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.renderDays = function(date){\n\
  var rows = this.rowsFor(date);\n\
  var html = map(rows, function(row){\n\
    return '<tr>' + row.join('') + '</tr>';\n\
  }).join('\\n\
');\n\
  return domify(html);\n\
};\n\
\n\
/**\n\
 * Return rows array for `date`.\n\
 *\n\
 * This method calculates the \"overflow\"\n\
 * from the previous month and into\n\
 * the next in order to display an\n\
 * even 5 rows.\n\
 *\n\
 * @param {Date} date\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.rowsFor = function(date){\n\
  var selected = this.selected;\n\
  var selectedDay = selected.getDate();\n\
  var selectedMonth = selected.getMonth();\n\
  var selectedYear = selected.getFullYear();\n\
  var month = date.getMonth();\n\
  var year = date.getFullYear();\n\
\n\
  // calculate overflow\n\
  var start = new Date(date);\n\
  start.setDate(1);\n\
  var before = start.getDay();\n\
  var total = daysInMonth(month, year);\n\
  var perRow = 7;\n\
  var totalShown = perRow * Math.ceil((total + before) / perRow);\n\
  var after = totalShown - (total + before);\n\
  var cells = [];\n\
\n\
  // cells before\n\
  cells = cells.concat(cellsBefore(before, month, year, this.validRange));\n\
\n\
  // current cells\n\
  for (var i = 0; i < total; ++i) {\n\
    var day = i + 1\n\
      , select = (day == selectedDay && month == selectedMonth && year == selectedYear);\n\
    cells.push(renderDay([year, month, day], this.validRange, select));\n\
  }\n\
\n\
  // after cells\n\
  cells = cells.concat(cellsAfter(after, month, year, this.validRange));\n\
\n\
  return inGroupsOf(cells, 7);\n\
};\n\
\n\
/**\n\
 * Update view title or select input for `year`.\n\
 *\n\
 * @param {Number} year\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.showSelectedYear = function(year){\n\
  if (this.selectYear) {\n\
    this.title.querySelector('.year .calendar-select').value = year;\n\
  } else {\n\
    this.title.querySelector('.year').innerHTML = year;\n\
  }\n\
};\n\
\n\
/**\n\
 * Update view title or select input for `month`.\n\
 *\n\
 * @param {Number} month\n\
 * @api private\n\
 */\n\
\n\
Days.prototype.showSelectedMonth = function(month) {\n\
  if (this.selectMonth) {\n\
    this.title.querySelector('.month .calendar-select').value = month;\n\
  } else {\n\
    this.title.querySelector('.month').innerHTML = months[month];\n\
  }\n\
};\n\
\n\
/**\n\
 * Return `n` days before `month`.\n\
 *\n\
 * @param {Number} n\n\
 * @param {Number} month\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function cellsBefore(n, month, year, validRange){\n\
  var cells = [];\n\
  if (month == 0) --year;\n\
  var prev = clamp(month - 1);\n\
  var before = daysInMonth(prev, year);\n\
  while (n--) cells.push(renderDay([year, prev, before--], validRange, false, 'prev-day'));\n\
  return cells.reverse();\n\
}\n\
\n\
/**\n\
 * Return `n` days after `month`.\n\
 *\n\
 * @param {Number} n\n\
 * @param {Number} month\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function cellsAfter(n, month, year, validRange){\n\
  var cells = [];\n\
  var day = 0;\n\
  if (month == 11) ++year;\n\
  var next = clamp(month + 1);\n\
  while (n--) cells.push(renderDay([year, next, ++day], validRange, false, 'next-day'));\n\
  return cells;\n\
}\n\
\n\
\n\
/**\n\
 * Day template.\n\
 */\n\
\n\
function renderDay(ymd, validRange, selected, style) {\n\
  var date = 'data-date=' + ymd.join('-')\n\
    , styles = []\n\
    , tdClass = ''\n\
    , aClass = '';\n\
\n\
  if (selected) {\n\
    tdClass = ' class=\"selected\"';\n\
  }\n\
  if (style) {\n\
    styles.push(style);\n\
  }\n\
  if (!validRange.valid(ymd)) {\n\
    styles.push('invalid');\n\
  }\n\
  if (styles.length) {\n\
    aClass = ' class=\"' + styles.join(' ') + '\"';\n\
  }\n\
\n\
\n\
  return '<td' + tdClass + '><a ' + date + aClass + '>' + ymd[2] + '</a></td>';\n\
}\n\
\n\
/**\n\
 * Year dropdown template.\n\
 */\n\
\n\
function yearDropdown(from, to) {\n\
  var years = range(from, to, 'inclusive');\n\
  var options = map(years, yearOption).join('');\n\
  return '<select class=\"calendar-select\">' + options + '</select>';\n\
}\n\
\n\
/**\n\
 * Month dropdown template.\n\
 */\n\
\n\
function monthDropdown() {\n\
  var options = map(months, monthOption).join('');\n\
  return '<select class=\"calendar-select\">' + options + '</select>';\n\
}\n\
\n\
/**\n\
 * Year dropdown option template.\n\
 */\n\
\n\
function yearOption(year) {\n\
  return '<option value=\"' + year + '\">' + year + '</option>';\n\
}\n\
\n\
/**\n\
 * Month dropdown option template.\n\
 */\n\
\n\
function monthOption(month, i) {\n\
  return '<option value=\"' + i + '\">' + month + '</option>';\n\
}\n\
//@ sourceURL=calendar/lib/days.js"
));


























require.alias("code42day-bounds/index.js", "calendar/deps/bounds/index.js");
require.alias("code42day-bounds/index.js", "bounds/index.js");
require.alias("component-clone/index.js", "code42day-bounds/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-bind/index.js", "calendar/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");

require.alias("component-domify/index.js", "calendar/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-classes/index.js", "calendar/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-event/index.js", "calendar/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-map/index.js", "calendar/deps/map/index.js");
require.alias("component-map/index.js", "map/index.js");
require.alias("component-to-function/index.js", "component-map/deps/to-function/index.js");
require.alias("component-props/index.js", "component-to-function/deps/props/index.js");

require.alias("component-range/index.js", "calendar/deps/range/index.js");
require.alias("component-range/index.js", "range/index.js");

require.alias("component-emitter/index.js", "calendar/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("component-in-groups-of/index.js", "calendar/deps/in-groups-of/index.js");
require.alias("component-in-groups-of/index.js", "in-groups-of/index.js");

require.alias("component-type/index.js", "calendar/deps/type/index.js");
require.alias("component-type/index.js", "type/index.js");

require.alias("yields-empty/index.js", "calendar/deps/empty/index.js");
require.alias("yields-empty/index.js", "calendar/deps/empty/index.js");
require.alias("yields-empty/index.js", "empty/index.js");
require.alias("yields-empty/index.js", "yields-empty/index.js");
require.alias("stephenmathieson-normalize/index.js", "calendar/deps/normalize/index.js");
require.alias("stephenmathieson-normalize/index.js", "calendar/deps/normalize/index.js");
require.alias("stephenmathieson-normalize/index.js", "normalize/index.js");
require.alias("stephenmathieson-normalize/index.js", "stephenmathieson-normalize/index.js");
