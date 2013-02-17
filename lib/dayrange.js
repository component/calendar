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

function compare(a, b) {
  return date(a).getTime() - date(b).getTime();
}

function distance(a, b) {
  return Math.abs(compare(a, b));
}

function DayRange(min, max) {
  Bounds(this);
  this.compare(compare);
  this.distance(distance);
  this.min(min).max(max);
  return this;
}
