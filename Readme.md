
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

  - `prev` when the prev link is clicked
  - `next` when the next link is clicked
  - `view change` (date) when the month/year dropdowns are changed
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

### Calendar#canSelectMonth()

  Adds a month dropdown to allow jumping to selected month.

### Calendar#selectYear([from], [to])

  Adds a year dropdown to allow jumping to selected year. `From` specifies the first year shown in the dropdown and `to` the last year. This means that if `to` is less than `from`, the years will be listed in descending order.

  If `from`/`to` are both not specified the dropdown defaults to -/+ 10 years from the calendar's date.

  If only `from` specified it defaults `to` +20 years from that year.

### Calendar#prev()

  Show the previous view (month).

### Calendar#next()

  Show the next view (month).

## Themes

  [Aurora](https://github.com/component/aurora-calendar):

  ![](https://a248.e.akamai.net/camo.github.com/2ca4c0ffd16267155335b2d9285c1923fa90e6d3/687474703a2f2f662e636c2e6c792f6974656d732f3034334e31723065314c313330793136325232662f53637265656e25323053686f74253230323031322d30392d31372532306174253230392e31372e3332253230504d2e706e67)

# License

  MIT

