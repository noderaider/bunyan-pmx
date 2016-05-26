'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _chai = require('chai');

var _bunyanSerializer = require('bunyan-serializer');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Bunyan writable stream that writes logs to pmx.
 */

var BunyanPmx = function (_EventEmitter) {
  _inherits(BunyanPmx, _EventEmitter);

  function BunyanPmx() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var data = _ref.data;
    var res = _ref.res;
    var reply = _ref.reply;
    var _ref$serializer = _ref.serializer;
    var serializer = _ref$serializer === undefined ? (0, _bunyanSerializer.createPrettySerializer)() : _ref$serializer;
    var _ref$hijackLoggers = _ref.hijackLoggers;
    var hijackLoggers = _ref$hijackLoggers === undefined ? [] : _ref$hijackLoggers;

    _classCallCheck(this, BunyanPmx);

    _chai.assert.ok(data && res || reply, 'bunyan-pmx requires data and res (scoped action) or reply (action).');
    _chai.assert.ok(!reply, 'bunyan-pmx does not yet support reply.');

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BunyanPmx).call(this));

    _this.hijackStreams = function () {
      try {
        _this.writeStreams.forEach(function (stream) {
          stream._originalWrite = stream.write.bind(stream);
          stream.write = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            try {
              stream._originalWrite.apply(stream, args);
            } catch (err) {
              _this.write({ level: 50, err: err, msg: 'error occurred writing to original stream with args ' + [].concat(args).join(', ') });
            }
            _this.write.apply(_this, args);
            return true;
          };
        });
      } catch (err) {
        _this.write({ err: err, level: 50, msg: 'an error occurred hijacking stream' });
      }
    };

    _this.write = function (x) {
      try {
        _this.res.send(_this.serializer(x));
      } catch (err) {
        _this.error(err);
        return false;
      }
      return true;
    };

    _this.error = function (err) {
      _this.emit('error', err);
    };

    _this.end = function () {
      if (arguments.length > 0) _this.write.apply(_this, arguments);
      _this.writable = false;
    };

    _this.destroy = function () {
      _this.writable = false;
      _this.res.end();
      _this.emit('close');
    };

    _this.destroySoon = function () {
      _this.destroy();
    };

    _this.data = data;
    _this.res = res;
    _this.serializer = serializer;
    _this.writable = true;
    _this.writeStreams = hijackLoggers.map(function (log) {
      return log.streams.map(function (_ref2) {
        var type = _ref2.type;
        var stream = _ref2.stream;
        var closeOnExit = _ref2.closeOnExit;
        var level = _ref2.level;
        var raw = _ref2.raw;
        return stream;
      });
    }).reduce(function (streams, x, i, arr) {
      return [].concat(_toConsumableArray(streams), _toConsumableArray(arr[i]));
    }, []);
    _this.hijackStreams();
    return _this;
  }

  return BunyanPmx;
}(_events.EventEmitter);

exports.default = BunyanPmx;