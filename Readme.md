
# Calendar

  Calendar UI component designed for use as a date-picker,
  full-sized calendar or anything in-between.

  ![javascript calendar component](http://f.cl.ly/items/2u3w1D421W0C370Z3G1U/Screen%20Shot%202012-10-11%20at%2014.32.41.png)

## Installation

    $ component install component/calendar

## Example

```js
var Calendar = require('calendar');
var cal = new Calendar;
cal.el.appendTo('body');
```

## Events

  - `view change` (date, action) when the viewed month/year is changed without modification of the selected date. This can be done either by next/prev buttons or dropdown menu. The action will be "prev", "next", "month" or "year" depending on what action caused the view to change.
  - `change` (date) when the selected date is modified

## API

### new Calendar(date)

  Initialize a new `Calendar` with the given `date` shown,
  defaulting to now.

### Calendar#select(date)

  Select the given `date` (`Date` object).

### Calendar#show(date)

  Show the given `date`. This does _not_ select the given date,
  it simply ensures that it is visible in the current view.

### Calendar#showMonthSelect()

  Add month selection input.

### Calendar#showYearSelect([from], [to])

  Add year selection input, with optional range specified by `from` and `to`,
  which default to the current year -10 / +10.

### Calendar#prev()

  Show the previous view (month).

### Calendar#next()

  Show the next view (month).

### Calendar#mix()

  Define earliest valid date - calendar won't generate `change` events for dates before this one.

### Calendar#max()

  Define latest valid date - calendar won't generate `change` events for dates after this one.

## Themes

  [Aurora](https://github.com/component/aurora-calendar):

  ![](https://a248.e.akamai.net/camo.github.com/2ca4c0ffd16267155335b2d9285c1923fa90e6d3/687474703a2f2f662e636c2e6c792f6974656d732f3034334e31723065314c313330793136325232662f53637265656e25323053686f74253230323031322d30392d31372532306174253230392e31372e3332253230504d2e706e67)

# License

  MIT

