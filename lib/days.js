
/**
 * Module dependencies.
 */

var o = require('jquery')
  , Emitter = require('emitter')
  , template = require('./template')
  , inGroupsOf = require('in-groups-of')
  , clamp = require('./utils').clamp;

/**
 * Days.
 */

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Months.
 */

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Get days in `month` for `year`.
 *
 * @param {Number} month
 * @param {Number} year
 * @return {Number}
 * @api private
 */

function daysInMonth(month, year) {
  return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

/**
 * Check if `year` is a leap year.
 *
 * @param {Number} year
 * @return {Boolean}
 * @api private
 */

function isLeapYear(year) {
  return ((0 == year % 4) && (0 != year % 100))
    || (0 == year);
}

/**
 * Expose `Days`.
 */

module.exports = Days;

/**
 * Initialize a new `Days` view.
 *
 * Emits:
 *
 *   - `prev` when prev link is clicked
 *   - `next` when next link is clicked
 *   - `change` (date) when a date is selected
 *
 * @api public
 */

function Days() {
  Emitter.call(this);
  var self = this;
  this.el = o(template).addClass('calendar-days');
  this.head = this.el.find('thead');
  this.body = this.el.find('tbody');
  this.title = this.el.find('.title a');
  this.select(new Date);

  // emit "day"
  this.body.on('click', 'a', function(e){
    var el = o(e.target);
    var day = parseInt(el.text(), 10);
    var data = el.data('date').split('-');
    var year = data[0];
    var month = data[1];
    var date = new Date;
    date.setYear(year);
    date.setMonth(month);
    date.setDate(day);
    self.select(date);
    self.emit('change', date);
    return false;
  });

  // emit "prev"
  this.el.find('.prev').click(function(){
    self.emit('prev');
    return false;
  });

  // emit "next"
  this.el.find('.next').click(function(){
    self.emit('next');
    return false;
  });
}

/**
 * Mixin emitter.
 */

Emitter(Days.prototype);

/**
 * Select the given `date`.
 *
 * @param {Date} date
 * @return {Days}
 * @api public
 */

Days.prototype.select = function(date){
  this.selected = date;
  return this;
};

/**
 * Show date selection.
 *
 * @param {Date} date
 * @api public
 */

Days.prototype.show = function(date){
  var year = date.getFullYear();
  var month = date.getMonth();
  this.title.text(months[month] + ' ' + year);
  this.head.find('.subheading').remove();
  this.head.append(this.renderHeading(2));
  this.body.empty();
  this.body.append(this.renderDays(date));
};

/**
 * Render days of the week heading with
 * the given `length`, for example 2 for "Tu",
 * 3 for "Tue" etc.
 *
 * @param {String} len
 * @return {Element}
 * @api private
 */

Days.prototype.renderHeading = function(len){
  var rows = '<tr class=subheading>' + days.map(function(day){
    return '<th>' + day.slice(0, len) + '</th>';
  }).join('') + '</tr>';
  return o(rows);
};

/**
 * Render days for `date`.
 *
 * @param {Date} date
 * @return {Element}
 * @api private
 */

Days.prototype.renderDays = function(date){
  var rows = this.rowsFor(date);
  var html = rows.map(function(row){
    return '<tr>' + row.join('') + '</tr>';
  }).join('\n');
  return o(html);
};

/**
 * Return rows array for `date`.
 *
 * This method calculates the "overflow"
 * from the previous month and into
 * the next in order to display an
 * even 5 rows. 
 *
 * @param {Date} date
 * @return {Array}
 * @api private
 */

Days.prototype.rowsFor = function(date){
  var selected = this.selected;
  var selectedDay = selected.getDate();
  var selectedMonth = selected.getMonth();
  var selectedYear = selected.getFullYear();
  var month = date.getMonth();
  var year = date.getFullYear();

  // calculate overflow
  var start = new Date(date);
  start.setDate(1);
  var before = start.getDay();
  var total = daysInMonth(month);
  var perRow = 7;
  var totalShown = perRow * Math.ceil((total + before) / perRow);
  var after = totalShown - (total + before);
  var cells = [];

  // cells before
  cells = cells.concat(cellsBefore(before, month, year));

  // current cells 
  for (var i = 0; i < total; ++i) {
    var day = i + 1;
    var date = 'data-date=' + [year, month, day].join('-');
    if (day == selectedDay && month == selectedMonth && year == selectedYear) {
      cells.push('<td class=selected><a href="#" ' + date + '>' + day + '</a></td>');
    } else {
      cells.push('<td><a href="#" ' + date + '>' + day + '</a></td>');
    }
  }

  // after cells
  cells = cells.concat(cellsAfter(after, month, year));

  return inGroupsOf(cells, 7);
};

/**
 * Return `n` days before `month`.
 *
 * @param {Number} n
 * @param {Number} month
 * @return {Array}
 * @api private
 */

function cellsBefore(n, month, year){
  var cells = [];
  if (month == 0) --year;
  var prev = clamp(month - 1);
  var before = daysInMonth(prev);
  while (n--) cells.push(prevMonthDay(year, prev, before--));
  return cells.reverse();
}

/**
 * Return `n` days after `month`.
 *
 * @param {Number} n
 * @param {Number} month
 * @return {Array}
 * @api private
 */

function cellsAfter(n, month, year){
  var cells = [];
  var day = 0;
  if (month == 11) ++year;
  var next = clamp(month + 1);
  while (n--) cells.push(nextMonthDay(year, next, ++day));
  return cells;
}

/**
 * Prev month day template.
 */

function prevMonthDay(year, month, day) {
  var date = 'data-date=' + [year, month, day].join('-');
  return '<td><a href="#" ' + date + ' class=prev-day>' + day + '</a></td>';
}

/**
 * Next month day template.
 */

function nextMonthDay(year, month, day) {
  var date = 'data-date=' + [year, month, day].join('-');
  return '<td><a href="#" ' + date + ' class=next-day>' + day + '</a></td>';
}

