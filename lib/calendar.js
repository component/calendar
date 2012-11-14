
/**
 * Module dependencies.
 */

var o = require('jquery')
  , Emitter = require('emitter')
  , template = require('./template')
  , Days = require('./days')
  , clamp = require('./utils').clamp;

/**
 * Expose `Calendar`.
 */

module.exports = Calendar;

/**
 * Initialize a new `Calendar`
 * with the given `date` defaulting
 * to now.
 *
 * Events:
 *
 *  - `prev` when the prev link is clicked
 *  - `next` when the next link is clicked
 *  - `change` (date) when the selected date is modified
 *
 * @params {Date} date
 * @api public
 */

function Calendar(date) {
  Emitter.call(this);
  var self = this;
  this.el = o('<div class=calendar></div>');
  this.days = new Days;
  this.el.append(this.days.el);
  this.on('change', this.show.bind(this));
  this.days.on('prev', this.prev.bind(this));
  this.days.on('next', this.next.bind(this));
  this.days.on('year', this.menuChange.bind(this, 'year'));
  this.days.on('month', this.menuChange.bind(this, 'month'));
  this.show(date || new Date);
  this.days.on('change', function(date){
    if (self.invalidDate(date)) { return };
    self.emit('change', date);
  });
}

/**
 * Mixin emitter.
 */

Emitter(Calendar.prototype);

/**
 * Add class `name` to differentiate this
 * specific calendar for styling purposes,
 * for example `calendar.addClass('date-picker')`.
 *
 * @param {String} name
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.addClass = function(name){
  this.el.addClass(name);
  return this;
};

/**
 * Select `date`.
 *
 * @param {Date} date
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.select = function(date){
  this.selected = date;
  this.days.select(date);
  this.show(date);
  return this;
};

/**
 * Show `date`.
 *
 * @param {Date} date
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.show = function(date){
  if (this.invalidDate(date)) { return this };
  this._date = date;
  this.days.show(date);
  return this;
};

/**
 * Enable a year dropdown.
 *
 * @param {Number} from
 * @param {Number} to
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.showYearSelect = function(from, to){
  from = from || this._date.getFullYear() - 10;
  to = to || this._date.getFullYear() + 10;
  this._from = from;
  this._to = to;
  this.days.yearMenu(from, to);
  this.show(this._date);
  return this;
};

/**
 * Enable a month dropdown.
 *
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.showMonthSelect = function(){
  this.days.monthMenu();
  this.show(this._date);
  return this;
};

/**
 * Return the previous month.
 *
 * @return {Date}
 * @api private
 */

Calendar.prototype.prevMonth = function(){
  var date = new Date(this._date);
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return date;
};

/**
 * Return the next month.
 *
 * @return {Date}
 * @api private
 */

Calendar.prototype.nextMonth = function(){
  var date = new Date(this._date);
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  return date;
};

/**
 * Show the prev view.
 *
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.prev = function(){
  this.show(this.prevMonth());
  this.emit('view change', this.days.selectedMonth(), 'prev');
  return this;
};

/**
 * Show the next view.
 *
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.next = function(){
  this.show(this.nextMonth());
  this.emit('view change', this.days.selectedMonth(), 'next');
  return this;
};

/**
 * Switch to the year or month selected by dropdown menu.
 *
 * @return {Calendar}
 * @api public
 */

Calendar.prototype.menuChange = function(action){
  var date = this.days.selectedMonth();
  this.show(date);
  this.emit('view change', date, action);
  return this;
};

/**
 * Check if date is outside the from/to years specified.
 *
 * @return {Boolean}
 * @api private
 */

Calendar.prototype.invalidDate = function(date) {
  var year = date.getFullYear();
  
  // allow for reversed range with from > to
  var from = this._to < this._from ? this._to : this._from;
  var to = this._to < this._from ? this._from : this._to;

  return year < from || year > to;
}
