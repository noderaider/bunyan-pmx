'use strict';

describe('bunyan-pmx', function () {
  var BunyanPmx = require('../../lib').default;

  var data = {};
  var res = { send: function send() {}, error: function error() {} };

  it('requires params', function () {
    return expect(function () {
      return new BunyanPmx();
    }).toThrow();
  });
  it('returns an object', function () {
    return expect(new BunyanPmx({ data: data, res: res })).toEqual(jasmine.any(Object));
  });
  it('has write function', function () {
    return expect(new BunyanPmx({ data: data, res: res }).write).toBeDefined();
  });
  it('has error function', function () {
    return expect(new BunyanPmx({ data: data, res: res }).error).toBeDefined();
  });
});