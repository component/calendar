var DayRange = require('../lib/dayrange')
  , assert = require('assert');

describe('day range', function(){
  it('should consider all dates as valid if no min/max specified', function(){
    var dr = new DayRange;
    assert.ok(!dr.before(new Date));
    assert.ok(!dr.after(new Date));
    assert.ok(dr.valid([2002, 12, 10]));
  });

  it('should consider dates inside of the range as valid', function(){
    var dr = new DayRange([2014, 3, 2], [2014, 4, 3]);
    assert.ok(dr.before([2014, 3, 1]));
    assert.ok(!dr.valid([2014, 3, 1]));
    assert.ok(dr.valid([2014, 3, 2]));
    assert.ok(dr.valid([2014, 3, 30]));
    assert.ok(dr.valid([2014, 4, 3]));
    assert.ok(!dr.valid([2014, 4, 4]));
    assert.ok(dr.after([2014, 4, 4]));
  });

  it('should work with mixture of dates and arrays', function(){
    var dr = new DayRange()
      .min([2014, 3, 2])
      .max(new Date(2014, 4, 3));
    assert.ok(dr.before(new Date(2014, 3, 1)));
    assert.ok(!dr.valid(new Date(2014, 3, 1)));
    assert.ok(dr.valid(new Date(2014, 3, 2)));
    assert.ok(dr.valid(new Date(2014, 3, 30)));
    assert.ok(dr.valid(new Date(2014, 4, 3)));
    assert.ok(!dr.valid(new Date(2014, 4, 4)));
    assert.ok(dr.after(new Date(2014, 4, 4)));
  });

  it('should work if only min is specified', function(){
    var dr = new DayRange([2013, 3, 3]);
    assert.ok(!dr.valid([2013, 3, 2]));
    assert.ok(dr.valid([2013, 3, 3]));
    assert.ok(dr.valid([2013, 3, 4]));
  });

  it('should work if only max is specified', function(){
    var dr = new DayRange(null, [2013, 3, 3]);
    assert.ok(dr.valid([2013, 3, 2]));
    assert.ok(dr.valid([2013, 3, 3]));
    assert.ok(!dr.valid([2013, 3, 4]));
  });
});