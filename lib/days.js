
/**
 * Module dependencies.
 */

var domify = require('domify')
  , Emitter = require('emitter')
  , classes = require('classes')
  , events = require('event')
  , map = require('map')
  , template = require('./template')
  , inGroupsOf = require('in-groups-of')
  , clamp = require('./utils').clamp
  , range = require('range')
  , empty = require('empty')
  , normalize = require('normalize')
  , DayRange = require('./dayrange');

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
  return (0 == year % 400)
    || ((0 == year % 4) && (0 != year % 100))
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
  this.el = domify(template);
  classes(this.el).add('calendar-days');
  this.head = this.el.tHead;
  this.body = this.el.tBodies[0];
  this.title = this.head.querySelector('.title');
  this.select(new Date);
  this.validRange = new DayRange;

  // emit "day"
  events.bind(this.body, 'click', normalize(function(e){
    if (e.target.tagName !== 'A') {
      return true;
    }

    e.preventDefault();

    var el = e.target;
    var data = el.getAttribute('data-date').split('-');
    if (!self.validRange.valid(data)) {
      return false;
    }
    var year = data[0];
    var month = data[1];
    var day = data[2];
    var date = new Date(year, month, day);
    self.select(date);
    self.emit('change', date);
    return false;
  }));

  // emit "prev"
  events.bind(this.el.querySelector('.prev'), 'click', normalize(function(ev){
    ev.preventDefault();

    self.emit('prev');
    return false;
  }));

  // emit "next"
  events.bind(this.el.querySelector('.next'), 'click', normalize(function(ev){
    ev.preventDefault();

    self.emit('next');
    return false;
  }));
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
  this.showSelectedYear(year);
  this.showSelectedMonth(month);
  var subhead = this.head.querySelector('.subheading');
  if (subhead) {
    subhead.parentElement.removeChild(subhead);
  }

  this.head.appendChild(this.renderHeading(2));
  empty(this.body);
  this.body.appendChild(this.renderDays(date));
};

/**
 * Enable a year dropdown.
 *
 * @param {Number} from
 * @param {Number} to
 * @api public
 */

Days.prototype.yearMenu = function(from, to){
  this.selectYear = true;
  this.title.querySelector('.year').innerHTML = yearDropdown(from, to);
  var self = this;
  events.bind(this.title.querySelector('.year .calendar-select'), 'change', function(){
    self.emit('year');
    return false;
  });
};

/**
 * Enable a month dropdown.
 *
 * @api public
 */

Days.prototype.monthMenu = function(){
  this.selectMonth = true;
  this.title.querySelector('.month').innerHTML = monthDropdown();
  var self = this;
  events.bind(this.title.querySelector('.month .calendar-select'), 'change', function(){
    self.emit('month');
    return false;
  });
};

/**
 * Return current year of view from title.
 *
 * @api private
 */

Days.prototype.titleYear = function(){
  if (this.selectYear) {
    return this.title.querySelector('.year .calendar-select').value;
  } else {
    return this.title.querySelector('.year').innerHTML;
  }
};

/**
 * Return current month of view from title.
 *
 * @api private
 */

Days.prototype.titleMonth = function(){
  if (this.selectMonth) {
    return this.title.querySelector('.month .calendar-select').value;
  } else {
    return this.title.querySelector('.month').innerHTML;
  }
};

/**
 * Return a date based on the field-selected month.
 *
 * @api public
 */

Days.prototype.selectedMonth = function(){
  return new Date(this.titleYear(), this.titleMonth(), 1);
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
  var rows = '<tr class=subheading>' + map(days, function(day){
    return '<th>' + day.slice(0, len) + '</th>';
  }).join('') + '</tr>';
  return domify(rows);
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
  var html = map(rows, function(row){
    return '<tr>' + row.join('') + '</tr>';
  }).join('\n');
  return domify(html);
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
  var total = daysInMonth(month, year);
  var perRow = 7;
  var totalShown = perRow * Math.ceil((total + before) / perRow);
  var after = totalShown - (total + before);
  var cells = [];

  // cells before
  cells = cells.concat(cellsBefore(before, month, year, this.validRange));

  // current cells
  for (var i = 0; i < total; ++i) {
    var day = i + 1
      , select = (day == selectedDay && month == selectedMonth && year == selectedYear);
    cells.push(renderDay([year, month, day], this.validRange, select));
  }

  // after cells
  cells = cells.concat(cellsAfter(after, month, year, this.validRange));

  return inGroupsOf(cells, 7);
};

/**
 * Update view title or select input for `year`.
 *
 * @param {Number} year
 * @api private
 */

Days.prototype.showSelectedYear = function(year){
  if (this.selectYear) {
    this.title.querySelector('.year .calendar-select').value = year;
  } else {
    this.title.querySelector('.year').innerHTML = year;
  }
};

/**
 * Update view title or select input for `month`.
 *
 * @param {Number} month
 * @api private
 */

Days.prototype.showSelectedMonth = function(month) {
  if (this.selectMonth) {
    this.title.querySelector('.month .calendar-select').value = month;
  } else {
    this.title.querySelector('.month').innerHTML = months[month];
  }
};

/**
 * Return `n` days before `month`.
 *
 * @param {Number} n
 * @param {Number} month
 * @return {Array}
 * @api private
 */

function cellsBefore(n, month, year, validRange){
  var cells = [];
  if (month == 0) --year;
  var prev = clamp(month - 1);
  var before = daysInMonth(prev, year);
  while (n--) cells.push(renderDay([year, prev, before--], validRange, false, 'prev-day'));
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

function cellsAfter(n, month, year, validRange){
  var cells = [];
  var day = 0;
  if (month == 11) ++year;
  var next = clamp(month + 1);
  while (n--) cells.push(renderDay([year, next, ++day], validRange, false, 'next-day'));
  return cells;
}


/**
 * Day template.
 */

function renderDay(ymd, validRange, selected, style) {
  var date = 'data-date=' + ymd.join('-')
    , styles = []
    , tdClass = ''
    , aClass = '';

  if (selected) {
    tdClass = ' class="selected"';
  }
  if (style) {
    styles.push(style);
  }
  if (!validRange.valid(ymd)) {
    styles.push('invalid');
  }
  if (styles.length) {
    aClass = ' class="' + styles.join(' ') + '"';
  }


  return '<td' + tdClass + '><a ' + date + aClass + '>' + ymd[2] + '</a></td>';
}

/**
 * Year dropdown template.
 */

function yearDropdown(from, to) {
  var years = range(from, to, 'inclusive');
  var options = map(years, yearOption).join('');
  return '<select class="calendar-select">' + options + '</select>';
}

/**
 * Month dropdown template.
 */

function monthDropdown() {
  var options = map(months, monthOption).join('');
  return '<select class="calendar-select">' + options + '</select>';
}

/**
 * Year dropdown option template.
 */

function yearOption(year) {
  return '<option value="' + year + '">' + year + '</option>';
}

/**
 * Month dropdown option template.
 */

function monthOption(month, i) {
  return '<option value="' + i + '">' + month + '</option>';
}
