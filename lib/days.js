
/**
 * Module dependencies.
 */

var classes = require('classes')
  , domify = require('domify')
  , byClass = require('get-by-class')
  , ev = require('event')
  , Emitter = require('emitter')
  , template = require('./template')
  , inGroupsOf = require('in-groups-of')
  , clamp = require('./utils').clamp
  , range = require('range')

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
 * Get the text contents of a node
 *
 * @param {Element} root node
 * @return {String} text contents
 * @api private
 */

function text(node) {
  return node.textContent || node.innerText;
}

/**
 * Get/set dropdown's value
 *
 * @param {Element} dropdown
 * @param {String} (Optional) value to set the dropdown to
 * @return {String} value if used as getter
 * @api private
 */

function val(dropdown, value) {
  if(!dropdown) return;
  if (value) {
    for (var i=0; i<dropdown.options.length; i++){
      if (dropdown.options[i].value == value){
        dropdown.options[i].selected = true;
        return;
      }
    }
  } else {
    return dropdown.options[dropdown.selectedIndex].value;
  }
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
  this.el = domify(template)[0];
  classes(this.el).add('calendar-days');
  this.head = this.el.getElementsByTagName('thead')[0];
  this.body = this.el.getElementsByTagName('tbody')[0];
  this.title = byClass(this.head, 'title', true);
  this.select(new Date);

  // emit "day"
  ev.bind(this.body, 'click', function(e){
    if(e.target && e.target.nodeName === 'A') {
      var el = e.target;
      var day = parseInt(text(el), 10);
      var data = el.getAttribute('data-date').split('-');
      var year = data[0];
      var month = data[1];
      var date = new Date;
      date.setYear(year);
      date.setMonth(month);
      date.setDate(day);
      self.select(date);
      self.emit('change', date);
      return false;
    }
  });

  // emit "prev"
  ev.bind(byClass(this.head, 'prev', true), 'click', function(){
    self.emit('prev');
    return false;
  });

  // emit "next"
  ev.bind(byClass(this.head, 'next', true), 'click', function(){
    self.emit('next');
    return false;
  });
}

/**
 * Mixin emitter.
 */

Emitter(Days.prototype);

/**
 * Get calendar-select node
 *
 * @param {String} class name of dropdown
 * @return {Element}
 * @api private
 */

Days.prototype._calendarSelect = function(rootClass){
  return byClass(byClass(this.title, rootClass, true), 'calendar-select', true);
}

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
  var subheading = byClass(this.head, 'subheading', true);
  if (subheading){
    this.head.removeChild(subheading);
  }
  this.head.appendChild(this.renderHeading(2));
  while (this.body.firstChild){
    this.body.removeChild(this.body.firstChild);
  }
  var dayRows = this.renderDays(date);
  for (var i=0;i<dayRows.length;i++){
    this.body.appendChild(dayRows[i]);
  }
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
  var title = this.head.getElementsByTagName('td')[1];
  byClass(this.title, 'year', true).innerHTML = yearDropdown(from, to);
  var self = this;
  ev.bind(this._calendarSelect('year'), 'change', function(){
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
  byClass(this.title, 'month', true).innerHTML = monthDropdown();
  var self = this;
  ev.bind(this._calendarSelect('month'), 'change', function(){
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
    return val(this._calendarSelect('year'));
  } else {
    return text(byClass(this.title, 'year', true));
  }
};

/**
 * Return current month of view from title.
 *
 * @api private
 */

Days.prototype.titleMonth = function(){
  if (this.selectMonth) {
    return val(this._calendarSelect('month'));
  } else {
    return text(byClass(this.title, 'month', true));
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
  var rows = '<tr class=subheading>' + days.map(function(day){
    return '<th>' + day.slice(0, len) + '</th>';
  }).join('') + '</tr>';
  return domify(rows)[0];
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
 * Update view title or select input for `year`.
 *
 * @param {Number} year
 * @api private
 */

Days.prototype.showSelectedYear = function(year){
  if (this.selectYear) {
    val(this._calendarSelect('year'), year);
  } else {
    byClass(this.title, 'year', true).innerHTML = year;
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
    val(this._calendarSelect('year'), month);
  } else {
    byClass(this.title, 'month', true).innerHTML = months[month];
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

/**
 * Year dropdown template.
 */

function yearDropdown(from, to) {
  var years = range(from, to, 'inclusive');
  var options = [];
  for (var i=0;i<years.length;i++){
    options.push(yearOption(years[i]));
  }
  return '<select class="calendar-select">' + options.join('') + '</select>';
}

/**
 * Month dropdown template.
 */

function monthDropdown() {
  var options = [];
  for (var i=0;i<months.length;i++){
    options.push(monthOption(months[i], i));
  }
  return '<select class="calendar-select">' + options.join(''); + '</select>';
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
