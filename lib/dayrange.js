module.exports = DayRange;

function ymd(date) {
  if (Array.isArray(date)) {
    return date;
  }
  return [date.getFullYear(), date.getMonth(), date.getDate()];
}

function compare(a, b) {
  var i, diff;
  for (i = 0; i < a.length; ++i) {
    diff = a[i] - b[i];
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function DayRange(min, max) {
  this.min(min).max(max);
  return this;
}

DayRange.prototype.min = function(v) {
  this._min = v ? ymd(v) : undefined;
  return this;
};

DayRange.prototype.max = function(v) {
  this._max = v ? ymd(v) : undefined;
  return this;
};

DayRange.prototype.before = function(day) {
  return this._min && (compare(ymd(day), this._min) < 0);
};

DayRange.prototype.after = function(day) {
  return this._max && (compare(ymd(day), this._max) > 0);
};

DayRange.prototype.valid = function(day) {
  return !this.before(day) && !this.after(day);
};
