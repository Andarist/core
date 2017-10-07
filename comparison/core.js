import { append, apply, compose, curry2, curry3, findIndex, id, map, reduce, remove } from '@most/prelude';
import { asap, cancelAllTasks, currentTime, delay, periodic, schedulerRelativeTo } from '@most/scheduler';
import { disposeAll, disposeBoth, disposeNone, disposeOnce, tryDispose } from '@most/disposable';

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function fatalError(e) {
  setTimeout(rethrow, 0, e);
}

function rethrow(e) {
  throw e;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var propagateTask$1 = function propagateTask(run, value, sink) {
  return new PropagateTask(run, value, sink);
};

var propagateEventTask$1 = function propagateEventTask(value, sink) {
  return propagateTask$1(runEvent, value, sink);
};

var propagateEndTask = function propagateEndTask(sink) {
  return propagateTask$1(runEnd, undefined, sink);
};

var propagateErrorTask$1 = function propagateErrorTask(value, sink) {
  return propagateTask$1(runError, value, sink);
};

var PropagateTask = /*#__PURE__*/function () {
  function PropagateTask(run, value, sink) {
    classCallCheck(this, PropagateTask);

    this._run = run;
    this.value = value;
    this.sink = sink;
    this.active = true;
  }

  PropagateTask.prototype.dispose = function dispose() {
    this.active = false;
  };

  PropagateTask.prototype.run = function run(t) {
    if (!this.active) {
      return;
    }
    var run = this._run;
    run(t, this.value, this.sink);
  };

  PropagateTask.prototype.error = function error(t, e) {
    // TODO: Remove this check and just do this.sink.error(t, e)?
    if (!this.active) {
      return fatalError(e);
    }
    this.sink.error(t, e);
  };

  return PropagateTask;
}();

var runEvent = function runEvent(t, x, sink) {
  return sink.event(t, x);
};

var runEnd = function runEnd(t, _, sink) {
  return sink.end(t);
};

var runError = function runError(t, e, sink) {
  return sink.error(t, e);
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var empty = function empty() {
  return EMPTY;
};

var Empty = /*#__PURE__*/function () {
  function Empty() {
    classCallCheck(this, Empty);
  }

  Empty.prototype.run = function run(sink, scheduler) {
    return asap(propagateEndTask(sink), scheduler);
  };

  return Empty;
}();

var EMPTY = /*#__PURE__*/new Empty();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var never = function never() {
  return NEVER;
};

var Never = /*#__PURE__*/function () {
  function Never() {
    classCallCheck(this, Never);
  }

  Never.prototype.run = function run() {
    return disposeNone();
  };

  return Never;
}();

var NEVER = /*#__PURE__*/new Never();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var at = function at(t, x) {
  return new At(t, x);
};

var At = /*#__PURE__*/function () {
  function At(t, x) {
    classCallCheck(this, At);

    this.time = t;
    this.value = x;
  }

  At.prototype.run = function run(sink, scheduler) {
    return delay(this.time, propagateTask$1(runAt, this.value, sink), scheduler);
  };

  return At;
}();

function runAt(t, x, sink) {
  sink.event(t, x);
  sink.end(t);
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var now = function now(x) {
  return at(0, x);
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Create a stream of events that occur at a regular period
 * @param {Number} period periodicity of events in millis
 * @returns {Stream} new stream of periodic events, the event value is undefined
 */
var periodic$1 = function periodic$$1(period) {
  return new Periodic(period);
};

var Periodic = /*#__PURE__*/function () {
  function Periodic(period) {
    classCallCheck(this, Periodic);

    this.period = period;
  }

  Periodic.prototype.run = function run(sink, scheduler) {
    return periodic(this.period, propagateEventTask$1(undefined, sink), scheduler);
  };

  return Periodic;
}();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var newStream = function newStream(run) {
  return new Stream(run);
};

var Stream = function Stream(run) {
  classCallCheck(this, Stream);

  this.run = run;
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */
/** @author Brian Cavalier */

var Pipe = /*#__PURE__*/function () {
  function Pipe(sink) {
    classCallCheck(this, Pipe);

    this.sink = sink;
  }

  Pipe.prototype.event = function event(t, x) {
    return this.sink.event(t, x);
  };

  Pipe.prototype.end = function end(t) {
    return this.sink.end(t);
  };

  Pipe.prototype.error = function error(t, e) {
    return this.sink.error(t, e);
  };

  return Pipe;
}();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var withArrayValues$1 = function withArrayValues(array, stream) {
  return zipArrayValues$1(keepLeft, array, stream);
};

var zipArrayValues$1 = function zipArrayValues(f, array, stream) {
  return array.length === 0 || stream === empty() ? empty() : new ZipArrayValues(f, array, stream);
};

var keepLeft = function keepLeft(a, _) {
  return a;
};

var ZipArrayValues = /*#__PURE__*/function () {
  function ZipArrayValues(f, values, source) {
    classCallCheck(this, ZipArrayValues);

    this.f = f;
    this.values = values;
    this.source = source;
  }

  ZipArrayValues.prototype.run = function run(sink, scheduler) {
    return this.source.run(new ZipArrayValuesSink(this.f, this.values, sink), scheduler);
  };

  return ZipArrayValues;
}();

var ZipArrayValuesSink = /*#__PURE__*/function (_Pipe) {
  inherits(ZipArrayValuesSink, _Pipe);

  function ZipArrayValuesSink(f, values, sink) {
    classCallCheck(this, ZipArrayValuesSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.values = values;
    _this.index = 0;
    return _this;
  }

  ZipArrayValuesSink.prototype.event = function event(t, b) {
    var f = this.f;
    this.sink.event(t, f(this.values[this.index], b));

    this.index += 1;
    if (this.index >= this.values.length) {
      this.sink.end(t);
    }
  };

  return ZipArrayValuesSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var SettableDisposable = /*#__PURE__*/function () {
  function SettableDisposable() {
    classCallCheck(this, SettableDisposable);

    this.disposable = undefined;
    this.disposed = false;
  }

  SettableDisposable.prototype.setDisposable = function setDisposable(disposable) {
    if (this.disposable !== void 0) {
      throw new Error('setDisposable called more than once');
    }

    this.disposable = disposable;

    if (this.disposed) {
      disposable.dispose();
    }
  };

  SettableDisposable.prototype.dispose = function dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    if (this.disposable !== void 0) {
      this.disposable.dispose();
    }
  };

  return SettableDisposable;
}();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var runEffects$1 = /*#__PURE__*/curry2(function (stream, scheduler) {
  return new Promise(function (resolve, reject) {
    return runStream(stream, scheduler, resolve, reject);
  });
});

function runStream(stream, scheduler, resolve, reject) {
  var disposable = new SettableDisposable();
  var observer = new RunEffectsSink(resolve, reject, disposable);

  disposable.setDisposable(stream.run(observer, scheduler));
}

var RunEffectsSink = /*#__PURE__*/function () {
  function RunEffectsSink(end, error, disposable) {
    classCallCheck(this, RunEffectsSink);

    this._end = end;
    this._error = error;
    this._disposable = disposable;
    this.active = true;
  }

  RunEffectsSink.prototype.event = function event(t, x) {};

  RunEffectsSink.prototype.end = function end(t) {
    if (!this.active) {
      return;
    }
    this._dispose(this._error, this._end, undefined);
  };

  RunEffectsSink.prototype.error = function error(t, e) {
    this._dispose(this._error, this._error, e);
  };

  RunEffectsSink.prototype._dispose = function _dispose(error, end, x) {
    this.active = false;
    tryDispose$1(error, end, x, this._disposable);
  };

  return RunEffectsSink;
}();

function tryDispose$1(error, end, x, disposable) {
  try {
    disposable.dispose();
  } catch (e) {
    error(e);
    return;
  }

  end(x);
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */

// Run a Stream, sending all its events to the
// provided Sink.
var run$1 = function run(sink, scheduler, stream) {
    return stream.run(sink, scheduler);
};

var RelativeSink = /*#__PURE__*/function () {
  function RelativeSink(offset, sink) {
    classCallCheck(this, RelativeSink);

    this.sink = sink;
    this.offset = offset;
  }

  RelativeSink.prototype.event = function event(t, x) {
    this.sink.event(t + this.offset, x);
  };

  RelativeSink.prototype.error = function error(t, e) {
    this.sink.error(t + this.offset, e);
  };

  RelativeSink.prototype.end = function end(t) {
    this.sink.end(t + this.offset);
  };

  return RelativeSink;
}();

// Create a stream with its own local clock
// This transforms time from the provided scheduler's clock to a stream-local
// clock (which starts at 0), and then *back* to the scheduler's clock before
// propagating events to sink.  In other words, upstream sources will see local times,
// and downstream sinks will see non-local (original) times.
var withLocalTime$1 = function withLocalTime(origin, stream) {
  return new WithLocalTime(origin, stream);
};

var WithLocalTime = /*#__PURE__*/function () {
  function WithLocalTime(origin, source) {
    classCallCheck(this, WithLocalTime);

    this.origin = origin;
    this.source = source;
  }

  WithLocalTime.prototype.run = function run(sink, scheduler) {
    return this.source.run(relativeSink(this.origin, sink), schedulerRelativeTo(this.origin, scheduler));
  };

  return WithLocalTime;
}();

// Accumulate offsets instead of nesting RelativeSinks, which can happen
// with higher-order stream and combinators like continueWith when they're
// applied recursively.


var relativeSink = function relativeSink(origin, sink) {
  return sink instanceof RelativeSink ? new RelativeSink(origin + sink.offset, sink.sink) : new RelativeSink(origin, sink);
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Generalized feedback loop. Call a stepper function for each event. The stepper
 * will be called with 2 params: the current seed and the an event value.  It must
 * return a new { seed, value } pair. The `seed` will be fed back into the next
 * invocation of stepper, and the `value` will be propagated as the event value.
 * @param {function(seed:*, value:*):{seed:*, value:*}} stepper loop step function
 * @param {*} seed initial seed value passed to first stepper call
 * @param {Stream} stream event stream
 * @returns {Stream} new stream whose values are the `value` field of the objects
 * returned by the stepper
 */
var loop$1 = function loop(stepper, seed, stream) {
  return new Loop(stepper, seed, stream);
};

var Loop = /*#__PURE__*/function () {
  function Loop(stepper, seed, source) {
    classCallCheck(this, Loop);

    this.step = stepper;
    this.seed = seed;
    this.source = source;
  }

  Loop.prototype.run = function run(sink, scheduler) {
    return this.source.run(new LoopSink(this.step, this.seed, sink), scheduler);
  };

  return Loop;
}();

var LoopSink = /*#__PURE__*/function (_Pipe) {
  inherits(LoopSink, _Pipe);

  function LoopSink(stepper, seed, sink) {
    classCallCheck(this, LoopSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.step = stepper;
    _this.seed = seed;
    return _this;
  }

  LoopSink.prototype.event = function event(t, x) {
    var result = this.step(this.seed, x);
    this.seed = result.seed;
    this.sink.event(t, result.value);
  };

  return LoopSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream stream to scan
 * @returns {Stream} new stream containing successive reduce results
 */
var scan$1 = function scan(f, initial, stream) {
  return new Scan(f, initial, stream);
};

var Scan = /*#__PURE__*/function () {
  function Scan(f, z, source) {
    classCallCheck(this, Scan);

    this.source = source;
    this.f = f;
    this.value = z;
  }

  Scan.prototype.run = function run(sink, scheduler) {
    var d1 = asap(propagateEventTask$1(this.value, sink), scheduler);
    var d2 = this.source.run(new ScanSink(this.f, this.value, sink), scheduler);
    return disposeBoth(d1, d2);
  };

  return Scan;
}();

var ScanSink = /*#__PURE__*/function (_Pipe) {
  inherits(ScanSink, _Pipe);

  function ScanSink(f, z, sink) {
    classCallCheck(this, ScanSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.value = z;
    return _this;
  }

  ScanSink.prototype.event = function event(t, x) {
    var f = this.f;
    this.value = f(this.value, x);
    this.sink.event(t, this.value);
  };

  return ScanSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var continueWith$1 = function continueWith(f, stream) {
  return new ContinueWith(f, stream);
};

var ContinueWith = /*#__PURE__*/function () {
  function ContinueWith(f, source) {
    classCallCheck(this, ContinueWith);

    this.f = f;
    this.source = source;
  }

  ContinueWith.prototype.run = function run(sink, scheduler) {
    return new ContinueWithSink(this.f, this.source, sink, scheduler);
  };

  return ContinueWith;
}();

var ContinueWithSink = /*#__PURE__*/function (_Pipe) {
  inherits(ContinueWithSink, _Pipe);

  function ContinueWithSink(f, source, sink, scheduler) {
    classCallCheck(this, ContinueWithSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.scheduler = scheduler;
    _this.active = true;
    _this.disposable = disposeOnce(source.run(_this, scheduler));
    return _this;
  }

  ContinueWithSink.prototype.event = function event(t, x) {
    if (!this.active) {
      return;
    }
    this.sink.event(t, x);
  };

  ContinueWithSink.prototype.end = function end(t) {
    if (!this.active) {
      return;
    }

    tryDispose(t, this.disposable, this.sink);

    this._startNext(t, this.sink);
  };

  ContinueWithSink.prototype._startNext = function _startNext(t, sink) {
    try {
      this.disposable = this._continue(this.f, t, sink);
    } catch (e) {
      sink.error(t, e);
    }
  };

  ContinueWithSink.prototype._continue = function _continue(f, t, sink) {
    return run$1(sink, this.scheduler, withLocalTime$1(t, f()));
  };

  ContinueWithSink.prototype.dispose = function dispose() {
    this.active = false;
    return this.disposable.dispose();
  };

  return ContinueWithSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var startWith$1 = function startWith(x, stream) {
  return continueWith$1(function () {
    return stream;
  }, now(x));
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Filter = /*#__PURE__*/function () {
  function Filter(p, source) {
    classCallCheck(this, Filter);

    this.p = p;
    this.source = source;
  }

  Filter.prototype.run = function run(sink, scheduler) {
    return this.source.run(new FilterSink(this.p, sink), scheduler);
  };

  /**
   * Create a filtered source, fusing adjacent filter.filter if possible
   * @param {function(x:*):boolean} p filtering predicate
   * @param {{run:function}} source source to filter
   * @returns {Filter} filtered source
   */


  Filter.create = function create(p, source) {
    if (source instanceof Filter) {
      return new Filter(and(source.p, p), source.source);
    }

    return new Filter(p, source);
  };

  return Filter;
}();

var FilterSink = /*#__PURE__*/function (_Pipe) {
  inherits(FilterSink, _Pipe);

  function FilterSink(p, sink) {
    classCallCheck(this, FilterSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.p = p;
    return _this;
  }

  FilterSink.prototype.event = function event(t, x) {
    var p = this.p;
    p(x) && this.sink.event(t, x);
  };

  return FilterSink;
}(Pipe);

var and = function and(p, q) {
  return function (x) {
    return p(x) && q(x);
  };
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var FilterMap = /*#__PURE__*/function () {
  function FilterMap(p, f, source) {
    classCallCheck(this, FilterMap);

    this.p = p;
    this.f = f;
    this.source = source;
  }

  FilterMap.prototype.run = function run(sink, scheduler) {
    return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler);
  };

  return FilterMap;
}();

var FilterMapSink = /*#__PURE__*/function (_Pipe) {
  inherits(FilterMapSink, _Pipe);

  function FilterMapSink(p, f, sink) {
    classCallCheck(this, FilterMapSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.p = p;
    _this.f = f;
    return _this;
  }

  FilterMapSink.prototype.event = function event(t, x) {
    var f = this.f;
    var p = this.p;
    p(x) && this.sink.event(t, f(x));
  };

  return FilterMapSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Map = /*#__PURE__*/function () {
  function Map(f, source) {
    classCallCheck(this, Map);

    this.f = f;
    this.source = source;
  }

  Map.prototype.run = function run(sink, scheduler) {
    // eslint-disable-line no-extend-native
    return this.source.run(new MapSink(this.f, sink), scheduler);
  };

  /**
   * Create a mapped source, fusing adjacent map.map, filter.map,
   * and filter.map.map if possible
   * @param {function(*):*} f mapping function
   * @param {{run:function}} source source to map
   * @returns {Map|FilterMap} mapped source, possibly fused
   */


  Map.create = function create(f, source) {
    if (source instanceof Map) {
      return new Map(compose(f, source.f), source.source);
    }

    if (source instanceof Filter) {
      return new FilterMap(source.p, f, source.source);
    }

    return new Map(f, source);
  };

  return Map;
}();

var MapSink = /*#__PURE__*/function (_Pipe) {
  inherits(MapSink, _Pipe);

  function MapSink(f, sink) {
    classCallCheck(this, MapSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    return _this;
  }

  MapSink.prototype.event = function event(t, x) {
    var f = this.f;
    this.sink.event(t, f(x));
  };

  return MapSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @param {Stream} stream stream to map
 * @returns {Stream} stream containing items transformed by f
 */
var map$2 = function map$$1(f, stream) {
  return Map.create(f, stream);
};

/**
* Replace each value in the stream with x
* @param {*} x
* @param {Stream} stream
* @returns {Stream} stream containing items replaced with x
*/
var constant$1 = function constant(x, stream) {
  return map$2(function () {
    return x;
  }, stream);
};

/**
* Perform a side effect for each item in the stream
* @param {function(x:*):*} f side effect to execute for each item. The
*  return value will be discarded.
* @param {Stream} stream stream to tap
* @returns {Stream} new stream containing the same items as this stream
*/
var tap$1 = function tap(f, stream) {
  return new Tap(f, stream);
};

var Tap = /*#__PURE__*/function () {
  function Tap(f, source) {
    classCallCheck(this, Tap);

    this.source = source;
    this.f = f;
  }

  Tap.prototype.run = function run(sink, scheduler) {
    return this.source.run(new TapSink(this.f, sink), scheduler);
  };

  return Tap;
}();

var TapSink = /*#__PURE__*/function (_Pipe) {
  inherits(TapSink, _Pipe);

  function TapSink(f, sink) {
    classCallCheck(this, TapSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    return _this;
  }

  TapSink.prototype.event = function event(t, x) {
    var f = this.f;
    f(x);
    this.sink.event(t, x);
  };

  return TapSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var IndexSink = /*#__PURE__*/function (_Sink) {
  inherits(IndexSink, _Sink);

  function IndexSink(i, sink) {
    classCallCheck(this, IndexSink);

    var _this = possibleConstructorReturn(this, _Sink.call(this, sink));

    _this.index = i;
    _this.active = true;
    _this.value = undefined;
    return _this;
  }

  IndexSink.prototype.event = function event(t, x) {
    if (!this.active) {
      return;
    }
    this.value = x;
    this.sink.event(t, this);
  };

  IndexSink.prototype.end = function end(t) {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.sink.event(t, this);
  };

  return IndexSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function invoke(f, args) {
  /* eslint complexity: [2,7] */
  switch (args.length) {
    case 0:
      return f();
    case 1:
      return f(args[0]);
    case 2:
      return f(args[0], args[1]);
    case 3:
      return f(args[0], args[1], args[2]);
    case 4:
      return f(args[0], args[1], args[2], args[3]);
    case 5:
      return f(args[0], args[1], args[2], args[3], args[4]);
    default:
      return f.apply(void 0, args);
  }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Combine latest events from two streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combine$1(f, stream1, stream2) {
  return combineArray$1(f, [stream1, stream2]);
}

/**
* Combine latest events from all input streams
* @param {function(...events):*} f function to combine most recent events
* @param {[Stream]} streams most recent events
* @returns {Stream} stream containing the result of applying f to the most recent
*  event of each input stream, whenever a new event arrives on any stream.
*/
var combineArray$1 = function combineArray(f, streams) {
  return streams.length === 0 ? empty() : streams.length === 1 ? map$2(f, streams[0]) : new Combine(f, streams);
};

var Combine = /*#__PURE__*/function () {
  function Combine(f, sources) {
    classCallCheck(this, Combine);

    this.f = f;
    this.sources = sources;
  }

  Combine.prototype.run = function run(sink, scheduler) {
    var l = this.sources.length;
    var disposables = new Array(l);
    var sinks = new Array(l);

    var mergeSink = new CombineSink(disposables, sinks, sink, this.f);

    for (var indexSink, i = 0; i < l; ++i) {
      indexSink = sinks[i] = new IndexSink(i, mergeSink);
      disposables[i] = this.sources[i].run(indexSink, scheduler);
    }

    return disposeAll(disposables);
  };

  return Combine;
}();

var CombineSink = /*#__PURE__*/function (_Pipe) {
  inherits(CombineSink, _Pipe);

  function CombineSink(disposables, sinks, sink, f) {
    classCallCheck(this, CombineSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.disposables = disposables;
    _this.sinks = sinks;
    _this.f = f;

    var l = sinks.length;
    _this.awaiting = l;
    _this.values = new Array(l);
    _this.hasValue = new Array(l).fill(false);
    _this.activeCount = sinks.length;
    return _this;
  }

  CombineSink.prototype.event = function event(t, indexedValue) {
    if (!indexedValue.active) {
      this._dispose(t, indexedValue.index);
      return;
    }

    var i = indexedValue.index;
    var awaiting = this._updateReady(i);

    this.values[i] = indexedValue.value;
    if (awaiting === 0) {
      this.sink.event(t, invoke(this.f, this.values));
    }
  };

  CombineSink.prototype._updateReady = function _updateReady(index) {
    if (this.awaiting > 0) {
      if (!this.hasValue[index]) {
        this.hasValue[index] = true;
        this.awaiting -= 1;
      }
    }
    return this.awaiting;
  };

  CombineSink.prototype._dispose = function _dispose(t, index) {
    tryDispose(t, this.disposables[index], this.sink);
    if (--this.activeCount === 0) {
      this.sink.end(t);
    }
  };

  return CombineSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Assume fs is a stream containing functions, and apply the latest function
 * in fs to the latest value in xs.
 * fs:         --f---------g--------h------>
 * xs:         -a-------b-------c-------d-->
 * ap(fs, xs): --fa-----fb-gb---gc--hc--hd->
 * @param {Stream} fs stream of functions to apply to the latest x
 * @param {Stream} xs stream of values to which to apply all the latest f
 * @returns {Stream} stream containing all the applications of fs to xs
 */
function ap$1(fs, xs) {
  return combine$1(apply, fs, xs);
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Doubly linked list
 * @constructor
 */
var LinkedList = /*#__PURE__*/function () {
  function LinkedList() {
    classCallCheck(this, LinkedList);

    this.head = null;
    this.length = 0;
  }

  /**
   * Add a node to the end of the list
   * @param {{prev:Object|null, next:Object|null, dispose:function}} x node to add
   */


  LinkedList.prototype.add = function add(x) {
    if (this.head !== null) {
      this.head.prev = x;
      x.next = this.head;
    }
    this.head = x;
    ++this.length;
  };

  /**
   * Remove the provided node from the list
   * @param {{prev:Object|null, next:Object|null, dispose:function}} x node to remove
   */


  LinkedList.prototype.remove = function remove$$1(x) {
    // eslint-disable-line  complexity
    --this.length;
    if (x === this.head) {
      this.head = this.head.next;
    }
    if (x.next !== null) {
      x.next.prev = x.prev;
      x.next = null;
    }
    if (x.prev !== null) {
      x.prev.next = x.next;
      x.prev = null;
    }
  };

  /**
   * @returns {boolean} true iff there are no nodes in the list
   */


  LinkedList.prototype.isEmpty = function isEmpty() {
    return this.length === 0;
  };

  /**
   * Dispose all nodes
   * @returns {Promise} promise that fulfills when all nodes have been disposed,
   *  or rejects if an error occurs while disposing
   */


  LinkedList.prototype.dispose = function dispose() {
    if (this.isEmpty()) {
      return Promise.resolve();
    }

    var promises = [];
    var x = this.head;
    this.head = null;
    this.length = 0;

    while (x !== null) {
      promises.push(x.dispose());
      x = x.next;
    }

    return Promise.all(promises);
  };

  return LinkedList;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var mergeConcurrently$1 = function mergeConcurrently(concurrency, stream) {
  return mergeMapConcurrently$1(id, concurrency, stream);
};

var mergeMapConcurrently$1 = function mergeMapConcurrently(f, concurrency, stream) {
  return new MergeConcurrently(f, concurrency, stream);
};

var MergeConcurrently = /*#__PURE__*/function () {
  function MergeConcurrently(f, concurrency, source) {
    classCallCheck(this, MergeConcurrently);

    this.f = f;
    this.concurrency = concurrency;
    this.source = source;
  }

  MergeConcurrently.prototype.run = function run(sink, scheduler) {
    return new Outer(this.f, this.concurrency, this.source, sink, scheduler);
  };

  return MergeConcurrently;
}();

var Outer = /*#__PURE__*/function () {
  function Outer(f, concurrency, source, sink, scheduler) {
    classCallCheck(this, Outer);

    this.f = f;
    this.concurrency = concurrency;
    this.sink = sink;
    this.scheduler = scheduler;
    this.pending = [];
    this.current = new LinkedList();
    this.disposable = disposeOnce(source.run(this, scheduler));
    this.active = true;
  }

  Outer.prototype.event = function event(t, x) {
    this._addInner(t, x);
  };

  Outer.prototype._addInner = function _addInner(t, x) {
    if (this.current.length < this.concurrency) {
      this._startInner(t, x);
    } else {
      this.pending.push(x);
    }
  };

  Outer.prototype._startInner = function _startInner(t, x) {
    try {
      this._initInner(t, x);
    } catch (e) {
      this.error(t, e);
    }
  };

  Outer.prototype._initInner = function _initInner(t, x) {
    var innerSink = new Inner(t, this, this.sink);
    innerSink.disposable = mapAndRun(this.f, t, x, innerSink, this.scheduler);
    this.current.add(innerSink);
  };

  Outer.prototype.end = function end(t) {
    this.active = false;
    tryDispose(t, this.disposable, this.sink);
    this._checkEnd(t);
  };

  Outer.prototype.error = function error(t, e) {
    this.active = false;
    this.sink.error(t, e);
  };

  Outer.prototype.dispose = function dispose() {
    this.active = false;
    this.pending.length = 0;
    this.disposable.dispose();
    this.current.dispose();
  };

  Outer.prototype._endInner = function _endInner(t, inner) {
    this.current.remove(inner);
    tryDispose(t, inner, this);

    if (this.pending.length === 0) {
      this._checkEnd(t);
    } else {
      this._startInner(t, this.pending.shift());
    }
  };

  Outer.prototype._checkEnd = function _checkEnd(t) {
    if (!this.active && this.current.isEmpty()) {
      this.sink.end(t);
    }
  };

  return Outer;
}();

var mapAndRun = function mapAndRun(f, t, x, sink, scheduler) {
  return f(x).run(sink, schedulerRelativeTo(t, scheduler));
};

var Inner = /*#__PURE__*/function () {
  function Inner(time, outer, sink) {
    classCallCheck(this, Inner);

    this.prev = this.next = null;
    this.time = time;
    this.outer = outer;
    this.sink = sink;
    this.disposable = void 0;
  }

  Inner.prototype.event = function event(t, x) {
    this.sink.event(t + this.time, x);
  };

  Inner.prototype.end = function end(t) {
    this.outer._endInner(t + this.time, this);
  };

  Inner.prototype.error = function error(t, e) {
    this.outer.error(t + this.time, e);
  };

  Inner.prototype.dispose = function dispose() {
    return this.disposable.dispose();
  };

  return Inner;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned outer stream. Event arrival times are preserved.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @param {Stream} stream
 * @returns {Stream} new stream containing all events from each stream returned by f
 */
var chain$1 = function chain(f, stream) {
  return mergeMapConcurrently$1(f, Infinity, stream);
};

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer. Event arrival times are preserved.
 * @param {Stream<Stream<X>>} stream stream of streams
 * @returns {Stream<X>} new stream containing all events of all inner streams
 */
var join = function join(stream) {
  return mergeConcurrently$1(Infinity, stream);
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Map each value in stream to a new stream, and concatenate them all
 * stream:              -a---b---cX
 * f(a):                 1-1-1-1X
 * f(b):                        -2-2-2-2X
 * f(c):                                -3-3-3-3X
 * stream.concatMap(f): -1-1-1-1-2-2-2-2-3-3-3-3X
 * @param {function(x:*):Stream} f function to map each value to a stream
 * @param {Stream} stream
 * @returns {Stream} new stream containing all events from each stream returned by f
 */
var concatMap$1 = function concatMap(f, stream) {
  return mergeMapConcurrently$1(f, 1, stream);
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * @returns {Stream} stream containing events from two streams in time order.
 * If two events are simultaneous they will be merged in arbitrary order.
 */
function merge$1(stream1, stream2) {
  return mergeArray([stream1, stream2]);
}

/**
 * @param {Array} streams array of stream to merge
 * @returns {Stream} stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
var mergeArray = function mergeArray(streams) {
  return streams.length === 0 ? empty() : streams.length === 1 ? streams[0] : mergeStreams(streams);
};

/**
 * This implements fusion/flattening for merge.  It will
 * fuse adjacent merge operations.  For example:
 * - a.merge(b).merge(c) effectively becomes merge(a, b, c)
 * - merge(a, merge(b, c)) effectively becomes merge(a, b, c)
 * It does this by concatenating the sources arrays of
 * any nested Merge sources, in effect "flattening" nested
 * merge operations into a single merge.
 */
var mergeStreams = function mergeStreams(streams) {
  return new Merge(reduce(appendSources, [], streams));
};

var appendSources = function appendSources(sources, stream) {
  return sources.concat(stream instanceof Merge ? stream.sources : stream);
};

var Merge = /*#__PURE__*/function () {
  function Merge(sources) {
    classCallCheck(this, Merge);

    this.sources = sources;
  }

  Merge.prototype.run = function run(sink, scheduler) {
    var l = this.sources.length;
    var disposables = new Array(l);
    var sinks = new Array(l);

    var mergeSink = new MergeSink(disposables, sinks, sink);

    for (var indexSink, i = 0; i < l; ++i) {
      indexSink = sinks[i] = new IndexSink(i, mergeSink);
      disposables[i] = this.sources[i].run(indexSink, scheduler);
    }

    return disposeAll(disposables);
  };

  return Merge;
}();

var MergeSink = /*#__PURE__*/function (_Pipe) {
  inherits(MergeSink, _Pipe);

  function MergeSink(disposables, sinks, sink) {
    classCallCheck(this, MergeSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.disposables = disposables;
    _this.activeCount = sinks.length;
    return _this;
  }

  MergeSink.prototype.event = function event(t, indexValue) {
    if (!indexValue.active) {
      this._dispose(t, indexValue.index);
      return;
    }
    this.sink.event(t, indexValue.value);
  };

  MergeSink.prototype._dispose = function _dispose(t, index) {
    tryDispose(t, this.disposables[index], this.sink);
    if (--this.activeCount === 0) {
      this.sink.end(t);
    }
  };

  return MergeSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */

var sample$1 = function sample(f, sampler, stream) {
  return new Sample(f, sampler, stream);
};

var Sample = /*#__PURE__*/function () {
  function Sample(f, sampler, stream) {
    classCallCheck(this, Sample);

    this.source = stream;
    this.sampler = sampler;
    this.f = f;
  }

  Sample.prototype.run = function run(sink, scheduler) {
    var sampleSink = new SampleSink(this.f, this.source, sink);
    var sourceDisposable = this.source.run(sampleSink.hold, scheduler);
    var samplerDisposable = this.sampler.run(sampleSink, scheduler);

    return disposeBoth(samplerDisposable, sourceDisposable);
  };

  return Sample;
}();

var SampleSink = /*#__PURE__*/function (_Pipe) {
  inherits(SampleSink, _Pipe);

  function SampleSink(f, source, sink) {
    classCallCheck(this, SampleSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.source = source;
    _this.f = f;
    _this.hold = new SampleHold(_this);
    return _this;
  }

  SampleSink.prototype.event = function event(t, x) {
    if (this.hold.hasValue) {
      var f = this.f;
      this.sink.event(t, f(x, this.hold.value));
    }
  };

  return SampleSink;
}(Pipe);

var SampleHold = /*#__PURE__*/function (_Pipe2) {
  inherits(SampleHold, _Pipe2);

  function SampleHold(sink) {
    classCallCheck(this, SampleHold);

    var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

    _this2.hasValue = false;
    return _this2;
  }

  SampleHold.prototype.event = function event(t, x) {
    this.value = x;
    this.hasValue = true;
  };

  SampleHold.prototype.end = function end() {};

  return SampleHold;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

// Based on https://github.com/petkaantonov/deque

var Queue = /*#__PURE__*/function () {
  function Queue() {
    var capPow2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
    classCallCheck(this, Queue);

    this._capacity = capPow2;
    this._length = 0;
    this._head = 0;
  }

  Queue.prototype.push = function push(x) {
    var len = this._length;
    this._checkCapacity(len + 1);

    var i = this._head + len & this._capacity - 1;
    this[i] = x;
    this._length = len + 1;
  };

  Queue.prototype.shift = function shift() {
    var head = this._head;
    var x = this[head];

    this[head] = void 0;
    this._head = head + 1 & this._capacity - 1;
    this._length--;
    return x;
  };

  Queue.prototype.isEmpty = function isEmpty() {
    return this._length === 0;
  };

  Queue.prototype.length = function length() {
    return this._length;
  };

  Queue.prototype._checkCapacity = function _checkCapacity(size) {
    if (this._capacity < size) {
      this._ensureCapacity(this._capacity << 1);
    }
  };

  Queue.prototype._ensureCapacity = function _ensureCapacity(capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;

    var last = this._head + this._length;

    if (last > oldCapacity) {
      copy(this, 0, this, oldCapacity, last & oldCapacity - 1);
    }
  };

  return Queue;
}();

function copy(src, srcIndex, dst, dstIndex, len) {
  for (var j = 0; j < len; ++j) {
    dst[j + dstIndex] = src[j + srcIndex];
    src[j + srcIndex] = void 0;
  }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Combine two streams pairwise by index by applying f to values at corresponding
 * indices.  The returned stream ends when either of the input streams ends.
 * @param {function} f function to combine values
 * @returns {Stream} new stream with items at corresponding indices combined
 *  using f
 */
function zip$1(f, stream1, stream2) {
  return zipArray$1(f, [stream1, stream2]);
}

/**
* Combine streams pairwise (or tuple-wise) by index by applying f to values
* at corresponding indices.  The returned stream ends when any of the input
* streams ends.
* @param {function} f function to combine values
* @param {[Stream]} streams streams to zip using f
* @returns {Stream} new stream with items at corresponding indices combined
*  using f
*/
var zipArray$1 = function zipArray(f, streams) {
  return streams.length === 0 ? empty() : streams.length === 1 ? map$2(f, streams[0]) : new Zip(f, streams);
};

var Zip = /*#__PURE__*/function () {
  function Zip(f, sources) {
    classCallCheck(this, Zip);

    this.f = f;
    this.sources = sources;
  }

  Zip.prototype.run = function run(sink, scheduler) {
    var l = this.sources.length;
    var disposables = new Array(l);
    var sinks = new Array(l);
    var buffers = new Array(l);

    var zipSink = new ZipSink(this.f, buffers, sinks, sink);

    for (var indexSink, i = 0; i < l; ++i) {
      buffers[i] = new Queue();
      indexSink = sinks[i] = new IndexSink(i, zipSink);
      disposables[i] = this.sources[i].run(indexSink, scheduler);
    }

    return disposeAll(disposables);
  };

  return Zip;
}();

var ZipSink = /*#__PURE__*/function (_Pipe) {
  inherits(ZipSink, _Pipe);

  function ZipSink(f, buffers, sinks, sink) {
    classCallCheck(this, ZipSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.sinks = sinks;
    _this.buffers = buffers;
    return _this;
  }

  ZipSink.prototype.event = function event(t, indexedValue) {
    /* eslint complexity: [1, 5] */
    if (!indexedValue.active) {
      this._dispose(t, indexedValue.index);
      return;
    }

    var buffers = this.buffers;
    var buffer = buffers[indexedValue.index];

    buffer.push(indexedValue.value);

    if (buffer.length() === 1) {
      if (!ready(this.buffers)) {
        return;
      }

      emitZipped(this.f, t, buffers, this.sink);

      if (ended(this.buffers, this.sinks)) {
        this.sink.end(t);
      }
    }
  };

  ZipSink.prototype._dispose = function _dispose(t, index) {
    var buffer = this.buffers[index];
    if (buffer.isEmpty()) {
      this.sink.end(t);
    }
  };

  return ZipSink;
}(Pipe);

var emitZipped = function emitZipped(f, t, buffers, sink) {
  return sink.event(t, invoke(f, map(head, buffers)));
};

var head = function head(buffer) {
  return buffer.shift();
};

function ended(buffers, sinks) {
  for (var i = 0, l = buffers.length; i < l; ++i) {
    if (buffers[i].isEmpty() && !sinks[i].active) {
      return true;
    }
  }
  return false;
}

function ready(buffers) {
  for (var i = 0, l = buffers.length; i < l; ++i) {
    if (buffers[i].isEmpty()) {
      return false;
    }
  }
  return true;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
var switchLatest = function switchLatest(stream) {
  return new Switch(stream);
};

var Switch = /*#__PURE__*/function () {
  function Switch(source) {
    classCallCheck(this, Switch);

    this.source = source;
  }

  Switch.prototype.run = function run(sink, scheduler) {
    var switchSink = new SwitchSink(sink, scheduler);
    return disposeBoth(switchSink, this.source.run(switchSink, scheduler));
  };

  return Switch;
}();

var SwitchSink = /*#__PURE__*/function () {
  function SwitchSink(sink, scheduler) {
    classCallCheck(this, SwitchSink);

    this.sink = sink;
    this.scheduler = scheduler;
    this.current = null;
    this.ended = false;
  }

  SwitchSink.prototype.event = function event(t, stream) {
    this._disposeCurrent(t);
    this.current = new Segment(stream, t, Infinity, this, this.sink, this.scheduler);
  };

  SwitchSink.prototype.end = function end(t) {
    this.ended = true;
    this._checkEnd(t);
  };

  SwitchSink.prototype.error = function error(t, e) {
    this.ended = true;
    this.sink.error(t, e);
  };

  SwitchSink.prototype.dispose = function dispose() {
    return this._disposeCurrent(currentTime(this.scheduler));
  };

  SwitchSink.prototype._disposeCurrent = function _disposeCurrent(t) {
    if (this.current !== null) {
      return this.current._dispose(t);
    }
  };

  SwitchSink.prototype._disposeInner = function _disposeInner(t, inner) {
    inner._dispose(t);
    if (inner === this.current) {
      this.current = null;
    }
  };

  SwitchSink.prototype._checkEnd = function _checkEnd(t) {
    if (this.ended && this.current === null) {
      this.sink.end(t);
    }
  };

  SwitchSink.prototype._endInner = function _endInner(t, inner) {
    this._disposeInner(t, inner);
    this._checkEnd(t);
  };

  SwitchSink.prototype._errorInner = function _errorInner(t, e, inner) {
    this._disposeInner(t, inner);
    this.sink.error(t, e);
  };

  return SwitchSink;
}();

var Segment = /*#__PURE__*/function () {
  function Segment(source, min, max, outer, sink, scheduler) {
    classCallCheck(this, Segment);

    this.min = min;
    this.max = max;
    this.outer = outer;
    this.sink = sink;
    this.disposable = source.run(this, schedulerRelativeTo(min, scheduler));
  }

  Segment.prototype.event = function event(t, x) {
    var time = Math.max(0, t + this.min);
    if (time < this.max) {
      this.sink.event(time, x);
    }
  };

  Segment.prototype.end = function end(t) {
    this.outer._endInner(t + this.min, this);
  };

  Segment.prototype.error = function error(t, e) {
    this.outer._errorInner(t + this.min, e, this);
  };

  Segment.prototype._dispose = function _dispose(t) {
    tryDispose(t + this.min, this.disposable, this.sink);
  };

  return Segment;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Retain only items matching a predicate
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @param {Stream} stream stream to filter
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
var filter$1 = function filter(p, stream) {
  return Filter.create(p, stream);
};

/**
 * Skip repeated events, using === to detect duplicates
 * @param {Stream} stream stream from which to omit repeated events
 * @returns {Stream} stream without repeated events
 */
var skipRepeats = function skipRepeats(stream) {
  return skipRepeatsWith$1(same, stream);
};

/**
 * Skip repeated events using the provided equals function to detect duplicates
 * @param {function(a:*, b:*):boolean} equals optional function to compare items
 * @param {Stream} stream stream from which to omit repeated events
 * @returns {Stream} stream without repeated events
 */
var skipRepeatsWith$1 = function skipRepeatsWith(equals, stream) {
  return new SkipRepeats(equals, stream);
};

var SkipRepeats = /*#__PURE__*/function () {
  function SkipRepeats(equals, source) {
    classCallCheck(this, SkipRepeats);

    this.equals = equals;
    this.source = source;
  }

  SkipRepeats.prototype.run = function run(sink, scheduler) {
    return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler);
  };

  return SkipRepeats;
}();

var SkipRepeatsSink = /*#__PURE__*/function (_Pipe) {
  inherits(SkipRepeatsSink, _Pipe);

  function SkipRepeatsSink(equals, sink) {
    classCallCheck(this, SkipRepeatsSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.equals = equals;
    _this.value = void 0;
    _this.init = true;
    return _this;
  }

  SkipRepeatsSink.prototype.event = function event(t, x) {
    if (this.init) {
      this.init = false;
      this.value = x;
      this.sink.event(t, x);
    } else if (!this.equals(this.value, x)) {
      this.value = x;
      this.sink.event(t, x);
    }
  };

  return SkipRepeatsSink;
}(Pipe);

function same(a, b) {
  return a === b;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream containing only up to the first n items from stream
 */
var take$1 = function take(n, stream) {
  return slice$1(0, n, stream);
};

/**
 * @param {number} n
 * @param {Stream} stream
 * @returns {Stream} new stream with the first n items removed
 */
var skip$1 = function skip(n, stream) {
  return slice$1(n, Infinity, stream);
};

/**
 * Slice a stream by index. Negative start/end indexes are not supported
 * @param {number} start
 * @param {number} end
 * @param {Stream} stream
 * @returns {Stream} stream containing items where start <= index < end
 */
var slice$1 = function slice(start, end, stream) {
  return end <= start ? empty() : sliceSource(start, end, stream);
};

var sliceSource = function sliceSource(start, end, stream) {
  return stream instanceof Map ? commuteMapSlice(start, end, stream) : stream instanceof Slice ? fuseSlice(start, end, stream) : new Slice(start, end, stream);
};

var commuteMapSlice = function commuteMapSlice(start, end, mapStream) {
  return Map.create(mapStream.f, sliceSource(start, end, mapStream.source));
};

function fuseSlice(start, end, sliceStream) {
  var fusedStart = start + sliceStream.min;
  var fusedEnd = Math.min(end + sliceStream.min, sliceStream.max);
  return new Slice(fusedStart, fusedEnd, sliceStream.source);
}

var Slice = /*#__PURE__*/function () {
  function Slice(min, max, source) {
    classCallCheck(this, Slice);

    this.source = source;
    this.min = min;
    this.max = max;
  }

  Slice.prototype.run = function run(sink, scheduler) {
    var disposable = new SettableDisposable();
    var sliceSink = new SliceSink(this.min, this.max - this.min, sink, disposable);

    disposable.setDisposable(this.source.run(sliceSink, scheduler));

    return disposable;
  };

  return Slice;
}();

var SliceSink = /*#__PURE__*/function (_Pipe) {
  inherits(SliceSink, _Pipe);

  function SliceSink(skip, take, sink, disposable) {
    classCallCheck(this, SliceSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.skip = skip;
    _this.take = take;
    _this.disposable = disposable;
    return _this;
  }

  SliceSink.prototype.event = function event(t, x) {
    /* eslint complexity: [1, 4] */
    if (this.skip > 0) {
      this.skip -= 1;
      return;
    }

    if (this.take === 0) {
      return;
    }

    this.take -= 1;
    this.sink.event(t, x);
    if (this.take === 0) {
      this.disposable.dispose();
      this.sink.end(t);
    }
  };

  return SliceSink;
}(Pipe);

var takeWhile$1 = function takeWhile(p, stream) {
  return new TakeWhile(p, stream);
};

var TakeWhile = /*#__PURE__*/function () {
  function TakeWhile(p, source) {
    classCallCheck(this, TakeWhile);

    this.p = p;
    this.source = source;
  }

  TakeWhile.prototype.run = function run(sink, scheduler) {
    var disposable = new SettableDisposable();
    var takeWhileSink = new TakeWhileSink(this.p, sink, disposable);

    disposable.setDisposable(this.source.run(takeWhileSink, scheduler));

    return disposable;
  };

  return TakeWhile;
}();

var TakeWhileSink = /*#__PURE__*/function (_Pipe2) {
  inherits(TakeWhileSink, _Pipe2);

  function TakeWhileSink(p, sink, disposable) {
    classCallCheck(this, TakeWhileSink);

    var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

    _this2.p = p;
    _this2.active = true;
    _this2.disposable = disposable;
    return _this2;
  }

  TakeWhileSink.prototype.event = function event(t, x) {
    if (!this.active) {
      return;
    }

    var p = this.p;
    this.active = p(x);

    if (this.active) {
      this.sink.event(t, x);
    } else {
      this.disposable.dispose();
      this.sink.end(t);
    }
  };

  return TakeWhileSink;
}(Pipe);

var skipWhile$1 = function skipWhile(p, stream) {
  return new SkipWhile(p, stream);
};

var SkipWhile = /*#__PURE__*/function () {
  function SkipWhile(p, source) {
    classCallCheck(this, SkipWhile);

    this.p = p;
    this.source = source;
  }

  SkipWhile.prototype.run = function run(sink, scheduler) {
    return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
  };

  return SkipWhile;
}();

var SkipWhileSink = /*#__PURE__*/function (_Pipe3) {
  inherits(SkipWhileSink, _Pipe3);

  function SkipWhileSink(p, sink) {
    classCallCheck(this, SkipWhileSink);

    var _this3 = possibleConstructorReturn(this, _Pipe3.call(this, sink));

    _this3.p = p;
    _this3.skipping = true;
    return _this3;
  }

  SkipWhileSink.prototype.event = function event(t, x) {
    if (this.skipping) {
      var p = this.p;
      this.skipping = p(x);
      if (this.skipping) {
        return;
      }
    }

    this.sink.event(t, x);
  };

  return SkipWhileSink;
}(Pipe);

var skipAfter$1 = function skipAfter(p, stream) {
  return new SkipAfter(p, stream);
};

var SkipAfter = /*#__PURE__*/function () {
  function SkipAfter(p, source) {
    classCallCheck(this, SkipAfter);

    this.p = p;
    this.source = source;
  }

  SkipAfter.prototype.run = function run(sink, scheduler) {
    return this.source.run(new SkipAfterSink(this.p, sink), scheduler);
  };

  return SkipAfter;
}();

var SkipAfterSink = /*#__PURE__*/function (_Pipe4) {
  inherits(SkipAfterSink, _Pipe4);

  function SkipAfterSink(p, sink) {
    classCallCheck(this, SkipAfterSink);

    var _this4 = possibleConstructorReturn(this, _Pipe4.call(this, sink));

    _this4.p = p;
    _this4.skipping = false;
    return _this4;
  }

  SkipAfterSink.prototype.event = function event(t, x) {
    if (this.skipping) {
      return;
    }

    var p = this.p;
    this.skipping = p(x);
    this.sink.event(t, x);

    if (this.skipping) {
      this.sink.end(t);
    }
  };

  return SkipAfterSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var until$1 = function until(signal, stream) {
  return new Until(signal, stream);
};

var since$1 = function since(signal, stream) {
  return new Since(signal, stream);
};

var during$1 = function during(timeWindow, stream) {
  return until$1(join(timeWindow), since$1(timeWindow, stream));
};

var Until = /*#__PURE__*/function () {
  function Until(maxSignal, source) {
    classCallCheck(this, Until);

    this.maxSignal = maxSignal;
    this.source = source;
  }

  Until.prototype.run = function run(sink, scheduler) {
    var min = new Bound(-Infinity, sink);
    var max = new UpperBound(this.maxSignal, sink, scheduler);
    var disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler);

    return disposeAll([min, max, disposable]);
  };

  return Until;
}();

var Since = /*#__PURE__*/function () {
  function Since(minSignal, source) {
    classCallCheck(this, Since);

    this.minSignal = minSignal;
    this.source = source;
  }

  Since.prototype.run = function run(sink, scheduler) {
    var min = new LowerBound(this.minSignal, sink, scheduler);
    var max = new Bound(Infinity, sink);
    var disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler);

    return disposeAll([min, max, disposable]);
  };

  return Since;
}();

var Bound = /*#__PURE__*/function (_Pipe) {
  inherits(Bound, _Pipe);

  function Bound(value, sink) {
    classCallCheck(this, Bound);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.value = value;
    return _this;
  }

  Bound.prototype.event = function event() {};

  Bound.prototype.end = function end() {};

  Bound.prototype.dispose = function dispose() {};

  return Bound;
}(Pipe);

var TimeWindowSink = /*#__PURE__*/function (_Pipe2) {
  inherits(TimeWindowSink, _Pipe2);

  function TimeWindowSink(min, max, sink) {
    classCallCheck(this, TimeWindowSink);

    var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

    _this2.min = min;
    _this2.max = max;
    return _this2;
  }

  TimeWindowSink.prototype.event = function event(t, x) {
    if (t >= this.min.value && t < this.max.value) {
      this.sink.event(t, x);
    }
  };

  return TimeWindowSink;
}(Pipe);

var LowerBound = /*#__PURE__*/function (_Pipe3) {
  inherits(LowerBound, _Pipe3);

  function LowerBound(signal, sink, scheduler) {
    classCallCheck(this, LowerBound);

    var _this3 = possibleConstructorReturn(this, _Pipe3.call(this, sink));

    _this3.value = Infinity;
    _this3.disposable = signal.run(_this3, scheduler);
    return _this3;
  }

  LowerBound.prototype.event = function event(t /*, x */) {
    if (t < this.value) {
      this.value = t;
    }
  };

  LowerBound.prototype.end = function end() {};

  LowerBound.prototype.dispose = function dispose() {
    return this.disposable.dispose();
  };

  return LowerBound;
}(Pipe);

var UpperBound = /*#__PURE__*/function (_Pipe4) {
  inherits(UpperBound, _Pipe4);

  function UpperBound(signal, sink, scheduler) {
    classCallCheck(this, UpperBound);

    var _this4 = possibleConstructorReturn(this, _Pipe4.call(this, sink));

    _this4.value = Infinity;
    _this4.disposable = signal.run(_this4, scheduler);
    return _this4;
  }

  UpperBound.prototype.event = function event(t, x) {
    if (t < this.value) {
      this.value = t;
      this.sink.end(t);
    }
  };

  UpperBound.prototype.end = function end() {};

  UpperBound.prototype.dispose = function dispose() {
    return this.disposable.dispose();
  };

  return UpperBound;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
var delay$2 = function delay$$1(delayTime, stream) {
  return delayTime <= 0 ? stream : new Delay(delayTime, stream);
};

var Delay = /*#__PURE__*/function () {
  function Delay(dt, source) {
    classCallCheck(this, Delay);

    this.dt = dt;
    this.source = source;
  }

  Delay.prototype.run = function run(sink, scheduler) {
    var delaySink = new DelaySink(this.dt, sink, scheduler);
    return disposeBoth(delaySink, this.source.run(delaySink, scheduler));
  };

  return Delay;
}();

var DelaySink = /*#__PURE__*/function (_Pipe) {
  inherits(DelaySink, _Pipe);

  function DelaySink(dt, sink, scheduler) {
    classCallCheck(this, DelaySink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.dt = dt;
    _this.scheduler = scheduler;
    return _this;
  }

  DelaySink.prototype.dispose = function dispose() {
    var _this2 = this;

    cancelAllTasks(function (task) {
      return task.sink === _this2.sink;
    }, this.scheduler);
  };

  DelaySink.prototype.event = function event(t, x) {
    delay(this.dt, propagateEventTask$1(x, this.sink), this.scheduler);
  };

  DelaySink.prototype.end = function end(t) {
    delay(this.dt, propagateEndTask(this.sink), this.scheduler);
  };

  return DelaySink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2017 original author or authors */

/**
 * Limit the rate of events by suppressing events that occur too often
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream}
 */
var throttle$1 = function throttle(period, stream) {
  return stream instanceof Map ? commuteMapThrottle(period, stream) : stream instanceof Throttle ? fuseThrottle(period, stream) : new Throttle(period, stream);
};

var commuteMapThrottle = function commuteMapThrottle(period, mapStream) {
  return Map.create(mapStream.f, throttle$1(period, mapStream.source));
};

var fuseThrottle = function fuseThrottle(period, throttleStream) {
  return new Throttle(Math.max(period, throttleStream.period), throttleStream.source);
};

var Throttle = /*#__PURE__*/function () {
  function Throttle(period, source) {
    classCallCheck(this, Throttle);

    this.period = period;
    this.source = source;
  }

  Throttle.prototype.run = function run(sink, scheduler) {
    return this.source.run(new ThrottleSink(this.period, sink), scheduler);
  };

  return Throttle;
}();

var ThrottleSink = /*#__PURE__*/function (_Pipe) {
  inherits(ThrottleSink, _Pipe);

  function ThrottleSink(period, sink) {
    classCallCheck(this, ThrottleSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.time = 0;
    _this.period = period;
    return _this;
  }

  ThrottleSink.prototype.event = function event(t, x) {
    if (t >= this.time) {
      this.time = t + this.period;
      this.sink.event(t, x);
    }
  };

  return ThrottleSink;
}(Pipe);
/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * @param {Number} period events occuring more frequently than this
 *  will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */


var debounce$1 = function debounce(period, stream) {
  return new Debounce(period, stream);
};

var Debounce = /*#__PURE__*/function () {
  function Debounce(dt, source) {
    classCallCheck(this, Debounce);

    this.dt = dt;
    this.source = source;
  }

  Debounce.prototype.run = function run(sink, scheduler) {
    return new DebounceSink(this.dt, this.source, sink, scheduler);
  };

  return Debounce;
}();

var DebounceSink = /*#__PURE__*/function () {
  function DebounceSink(dt, source, sink, scheduler) {
    classCallCheck(this, DebounceSink);

    this.dt = dt;
    this.sink = sink;
    this.scheduler = scheduler;
    this.value = void 0;
    this.timer = null;

    this.disposable = source.run(this, scheduler);
  }

  DebounceSink.prototype.event = function event(t, x) {
    this._clearTimer();
    this.value = x;
    this.timer = delay(this.dt, propagateEventTask$1(x, this.sink), this.scheduler);
  };

  DebounceSink.prototype.end = function end(t) {
    if (this._clearTimer()) {
      this.sink.event(t, this.value);
      this.value = undefined;
    }
    this.sink.end(t);
  };

  DebounceSink.prototype.error = function error(t, x) {
    this._clearTimer();
    this.sink.error(t, x);
  };

  DebounceSink.prototype.dispose = function dispose() {
    this._clearTimer();
    this.disposable.dispose();
  };

  DebounceSink.prototype._clearTimer = function _clearTimer() {
    if (this.timer === null) {
      return false;
    }
    this.timer.dispose();
    this.timer = null;
    return true;
  };

  return DebounceSink;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Turn a Stream<Promise<T>> into Stream<T> by awaiting each promise.
 * Event order is preserved. The stream will fail if any promise rejects.
 */
var awaitPromises = function awaitPromises(stream) {
  return new Await(stream);
};

/**
 * Create a stream containing only the promise's fulfillment
 * value at the time it fulfills.
 * @param {Promise<T>} p promise
 * @return {Stream<T>} stream containing promise's fulfillment value.
 *  If the promise rejects, the stream will error
 */
var fromPromise = /*#__PURE__*/compose(awaitPromises, now);

var Await = /*#__PURE__*/function () {
  function Await(source) {
    classCallCheck(this, Await);

    this.source = source;
  }

  Await.prototype.run = function run(sink, scheduler) {
    return this.source.run(new AwaitSink(sink, scheduler), scheduler);
  };

  return Await;
}();

var AwaitSink = /*#__PURE__*/function () {
  function AwaitSink(sink, scheduler) {
    var _this = this;

    classCallCheck(this, AwaitSink);

    this.sink = sink;
    this.scheduler = scheduler;
    this.queue = Promise.resolve();

    // Pre-create closures, to avoid creating them per event
    this._eventBound = function (x) {
      return _this.sink.event(currentTime(_this.scheduler), x);
    };
    this._endBound = function () {
      return _this.sink.end(currentTime(_this.scheduler));
    };
    this._errorBound = function (e) {
      return _this.sink.error(currentTime(_this.scheduler), e);
    };
  }

  AwaitSink.prototype.event = function event(t, promise) {
    var _this2 = this;

    this.queue = this.queue.then(function () {
      return _this2._event(promise);
    }).catch(this._errorBound);
  };

  AwaitSink.prototype.end = function end(t) {
    this.queue = this.queue.then(this._endBound).catch(this._errorBound);
  };

  AwaitSink.prototype.error = function error(t, e) {
    var _this3 = this;

    // Don't resolve error values, propagate directly
    this.queue = this.queue.then(function () {
      return _this3._errorBound(e);
    }).catch(fatalError);
  };

  AwaitSink.prototype._event = function _event(promise) {
    return promise.then(this._eventBound);
  };

  return AwaitSink;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var SafeSink = /*#__PURE__*/function () {
  function SafeSink(sink) {
    classCallCheck(this, SafeSink);

    this.sink = sink;
    this.active = true;
  }

  SafeSink.prototype.event = function event(t, x) {
    if (!this.active) {
      return;
    }
    this.sink.event(t, x);
  };

  SafeSink.prototype.end = function end(t, x) {
    if (!this.active) {
      return;
    }
    this.disable();
    this.sink.end(t, x);
  };

  SafeSink.prototype.error = function error(t, e) {
    this.disable();
    this.sink.error(t, e);
  };

  SafeSink.prototype.disable = function disable() {
    this.active = false;
    return this.sink;
  };

  return SafeSink;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function tryEvent(t, x, sink) {
  try {
    sink.event(t, x);
  } catch (e) {
    sink.error(t, e);
  }
}

function tryEnd(t, sink) {
  try {
    sink.end(t);
  } catch (e) {
    sink.error(t, e);
  }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
var recoverWith$1 = function recoverWith(f, stream) {
  return new RecoverWith(f, stream);
};

/**
 * Create a stream containing only an error
 * @param {*} e error value, preferably an Error or Error subtype
 * @returns {Stream} new stream containing only an error
 */
var throwError = function throwError(e) {
  return new ErrorStream(e);
};

var ErrorStream = /*#__PURE__*/function () {
  function ErrorStream(e) {
    classCallCheck(this, ErrorStream);

    this.value = e;
  }

  ErrorStream.prototype.run = function run(sink, scheduler) {
    return asap(propagateErrorTask$1(this.value, sink), scheduler);
  };

  return ErrorStream;
}();

var RecoverWith = /*#__PURE__*/function () {
  function RecoverWith(f, source) {
    classCallCheck(this, RecoverWith);

    this.f = f;
    this.source = source;
  }

  RecoverWith.prototype.run = function run(sink, scheduler) {
    return new RecoverWithSink(this.f, this.source, sink, scheduler);
  };

  return RecoverWith;
}();

var RecoverWithSink = /*#__PURE__*/function () {
  function RecoverWithSink(f, source, sink, scheduler) {
    classCallCheck(this, RecoverWithSink);

    this.f = f;
    this.sink = new SafeSink(sink);
    this.scheduler = scheduler;
    this.disposable = source.run(this, scheduler);
  }

  RecoverWithSink.prototype.event = function event(t, x) {
    tryEvent(t, x, this.sink);
  };

  RecoverWithSink.prototype.end = function end(t) {
    tryEnd(t, this.sink);
  };

  RecoverWithSink.prototype.error = function error(t, e) {
    var nextSink = this.sink.disable();

    tryDispose(t, this.disposable, this.sink);

    this._startNext(t, e, nextSink);
  };

  RecoverWithSink.prototype._startNext = function _startNext(t, x, sink) {
    try {
      this.disposable = this._continue(this.f, t, x, sink);
    } catch (e) {
      sink.error(t, e);
    }
  };

  RecoverWithSink.prototype._continue = function _continue(f, t, x, sink) {
    return run$1(sink, this.scheduler, withLocalTime$1(t, f(x)));
  };

  RecoverWithSink.prototype.dispose = function dispose() {
    return this.disposable.dispose();
  };

  return RecoverWithSink;
}();

var multicast = function multicast(stream) {
  return stream instanceof Multicast ? stream : new Multicast(stream);
};

var Multicast = /*#__PURE__*/function () {
  function Multicast(source) {
    classCallCheck(this, Multicast);

    this.source = new MulticastSource(source);
  }

  Multicast.prototype.run = function run(sink, scheduler) {
    return this.source.run(sink, scheduler);
  };

  return Multicast;
}();

var MulticastSource = /*#__PURE__*/function () {
  function MulticastSource(source) {
    classCallCheck(this, MulticastSource);

    this.source = source;
    this.sinks = [];
    this.disposable = disposeNone();
  }

  MulticastSource.prototype.run = function run(sink, scheduler) {
    var n = this.add(sink);
    if (n === 1) {
      this.disposable = this.source.run(this, scheduler);
    }
    return disposeOnce(new MulticastDisposable(this, sink));
  };

  MulticastSource.prototype.dispose = function dispose() {
    var disposable = this.disposable;
    this.disposable = disposeNone();
    return disposable.dispose();
  };

  MulticastSource.prototype.add = function add(sink) {
    this.sinks = append(sink, this.sinks);
    return this.sinks.length;
  };

  MulticastSource.prototype.remove = function remove$$1(sink) {
    var i = findIndex(sink, this.sinks);
    // istanbul ignore next
    if (i >= 0) {
      this.sinks = remove(i, this.sinks);
    }

    return this.sinks.length;
  };

  MulticastSource.prototype.event = function event(time, value) {
    var s = this.sinks;
    if (s.length === 1) {
      return s[0].event(time, value);
    }
    for (var i = 0; i < s.length; ++i) {
      tryEvent(time, value, s[i]);
    }
  };

  MulticastSource.prototype.end = function end(time) {
    var s = this.sinks;
    for (var i = 0; i < s.length; ++i) {
      tryEnd(time, s[i]);
    }
  };

  MulticastSource.prototype.error = function error(time, err) {
    var s = this.sinks;
    for (var i = 0; i < s.length; ++i) {
      s[i].error(time, err);
    }
  };

  return MulticastSource;
}();

var MulticastDisposable = /*#__PURE__*/function () {
  function MulticastDisposable(source, sink) {
    classCallCheck(this, MulticastDisposable);

    this.source = source;
    this.sink = sink;
  }

  MulticastDisposable.prototype.dispose = function dispose() {
    if (this.source.remove(this.sink) === 0) {
      this.source.dispose();
    }
  };

  return MulticastDisposable;
}();

/** @license MIT License (c) copyright 2016 original author or authors */
/* eslint-disable import/first */
var zipArrayValues = /*#__PURE__*/curry3(zipArrayValues$1);
var withArrayValues = /*#__PURE__*/curry2(withArrayValues$1);

// -----------------------------------------------------------------------
// Observing

var runEffects = /*#__PURE__*/curry2(runEffects$1);
var run = /*#__PURE__*/curry3(run$1);

// -------------------------------------------------------

var withLocalTime = /*#__PURE__*/curry2(withLocalTime$1);

// -------------------------------------------------------

var loop = /*#__PURE__*/curry3(loop$1);

// -------------------------------------------------------

var scan = /*#__PURE__*/curry3(scan$1);

// -----------------------------------------------------------------------
// Extending

var startWith = /*#__PURE__*/curry2(startWith$1);

// -----------------------------------------------------------------------
// Transforming

var map$1 = /*#__PURE__*/curry2(map$2);
var constant = /*#__PURE__*/curry2(constant$1);
var tap = /*#__PURE__*/curry2(tap$1);
var ap = /*#__PURE__*/curry2(ap$1);

// -----------------------------------------------------------------------
// FlatMapping

var chain = /*#__PURE__*/curry2(chain$1);
var continueWith = /*#__PURE__*/curry2(continueWith$1);

var concatMap = /*#__PURE__*/curry2(concatMap$1);

// -----------------------------------------------------------------------
// Concurrent merging

var mergeConcurrently = /*#__PURE__*/curry2(mergeConcurrently$1);
var mergeMapConcurrently = /*#__PURE__*/curry3(mergeMapConcurrently$1);

// -----------------------------------------------------------------------
// Merging

var merge = /*#__PURE__*/curry2(merge$1);
// -----------------------------------------------------------------------
// Combining

var combine = /*#__PURE__*/curry3(combine$1);
var combineArray = /*#__PURE__*/curry2(combineArray$1);

// -----------------------------------------------------------------------
// Sampling

var sample = /*#__PURE__*/curry3(sample$1);

// -----------------------------------------------------------------------
// Zipping

var zip = /*#__PURE__*/curry3(zip$1);
var zipArray = /*#__PURE__*/curry2(zipArray$1);

// -----------------------------------------------------------------------
// Filtering

var filter = /*#__PURE__*/curry2(filter$1);
var skipRepeatsWith = /*#__PURE__*/curry2(skipRepeatsWith$1);

// -----------------------------------------------------------------------
// Slicing

var take = /*#__PURE__*/curry2(take$1);
var skip = /*#__PURE__*/curry2(skip$1);
var slice = /*#__PURE__*/curry3(slice$1);
var takeWhile = /*#__PURE__*/curry2(takeWhile$1);
var skipWhile = /*#__PURE__*/curry2(skipWhile$1);
var skipAfter = /*#__PURE__*/curry2(skipAfter$1);

// -----------------------------------------------------------------------
// Time slicing

var until = /*#__PURE__*/curry2(until$1);
var since = /*#__PURE__*/curry2(since$1);
var during = /*#__PURE__*/curry2(during$1);

// -----------------------------------------------------------------------
// Delaying

var delay$1 = /*#__PURE__*/curry2(delay$2);

// -----------------------------------------------------------------------
// Rate limiting

var throttle = /*#__PURE__*/curry2(throttle$1);
var debounce = /*#__PURE__*/curry2(debounce$1);

// -----------------------------------------------------------------------
// Error handling

var recoverWith = /*#__PURE__*/curry2(recoverWith$1);
// ----------------------------------------------------------------------
var propagateTask = /*#__PURE__*/curry3(propagateTask$1);
var propagateEventTask = /*#__PURE__*/curry2(propagateEventTask$1);
var propagateErrorTask = /*#__PURE__*/curry2(propagateErrorTask$1);

export { zipArrayValues, withArrayValues, runEffects, run, withLocalTime, loop, scan, startWith, map$1 as map, constant, tap, ap, chain, join, continueWith, concatMap, mergeConcurrently, mergeMapConcurrently, merge, mergeArray, combine, combineArray, sample, zip, zipArray, filter, skipRepeats, skipRepeatsWith, take, skip, slice, takeWhile, skipWhile, skipAfter, until, since, during, delay$1 as delay, throttle, debounce, recoverWith, throwError, propagateTask, propagateEventTask, propagateErrorTask, propagateEndTask, empty, never, now, at, periodic$1 as periodic, newStream, switchLatest, fromPromise, awaitPromises, multicast, MulticastSource };
//# sourceMappingURL=mostCore.es.js.map
