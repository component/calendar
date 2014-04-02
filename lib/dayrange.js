var Bounds = require('bounds');

var type;

if (typeof window !== 'undefined') {
  type = require('type');
} else {
  type = require('type-component');
}

module.exports = DayRange;

function date(d) {
  return type(d) === 'date' ? d : new Date(d[0], d[1], d[2]);
}

function DayRange(min, max) {
  return this.min(min).max(max);
}

Bounds(DayRange.prototype);

DayRange.prototype._compare = function(a, b) {
  return date(a).getTime() - date(b).getTime();
}

DayRange.prototype._distance = function(a, b) {
  return Math.abs(this.compare(a, b));
}
