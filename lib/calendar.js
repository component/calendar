
/**
 * Module dependencies.
 */

var bind = require('bind')
  , domify = require('domify')
  , Emitter = require('emitter')
  , classes = require('classes')
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
  if (!(this instanceof Calendar)) {
    return new Calendar(date);
  }

  Emitter.call(this);
  var self = this;
  this.el = domify('<div class=calendar></div>');
  this.days = new Days;
  this.el.appendChild(this.days.el);
  this.on('change', bind(this, this.show));
  this.days.on('prev', bind(this, this.prev));
  this.days.on('next', bind(this, this.next));
  this.days.on('year', bind(this, this.menuChange, 'year'));
  this.days.on('month', bind(this, this.menuChange, 'month'));
  this.show(date || new Date);
  this.days.on('change', function(date){
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
  classes(this.el).add(name);
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
  if (this.days.validRange.valid(date)) {
    this.selected = date;
    this.days.select(date);
  }
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
  this._date = date;
  this.days.show(date);
  return this;
};

/**
 * Set minimum valid date (inclusive)
 *
 * @param {Date} date
 * @api public
 */

Calendar.prototype.min = function(date) {
  this.days.validRange.min(date);
  return this;
};


/**
 * Set maximum valid date (inclusive)
 *
 * @param {Date} date
 * @api public
 */

Calendar.prototype.max = function(date) {
  this.days.validRange.max(date);
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
