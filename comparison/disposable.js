import { curry2, curry3, reduce } from '@most/prelude';

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var dispose = function dispose(disposable) {
  return disposable.dispose();
};

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

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var disposeNone = function disposeNone() {
  return NONE;
};
var NONE = /*#__PURE__*/new (function () {
  function DisposeNone() {
    classCallCheck(this, DisposeNone);
  }

  DisposeNone.prototype.dispose = function dispose() {};

  return DisposeNone;
}())();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

// Wrap an existing disposable (which may not already have been once()d)
// so that it will only dispose its underlying resource at most once.
var disposeOnce = function disposeOnce(disposable) {
  return new DisposeOnce(disposable);
};

var DisposeOnce = /*#__PURE__*/function () {
  function DisposeOnce(disposable) {
    classCallCheck(this, DisposeOnce);

    this.disposed = false;
    this.disposable = disposable;
  }

  DisposeOnce.prototype.dispose = function dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.disposable.dispose();
      this.disposable = undefined;
    }
  };

  return DisposeOnce;
}();

/** @license MIT License (c) copyright 2010-2017 original author or authors */
// Create a Disposable that will use the provided
// dispose function to dispose the resource
var disposeWith = /*#__PURE__*/curry2(function (dispose, resource) {
  return disposeOnce(new DisposeWith(dispose, resource));
});

// Disposable represents a resource that must be
// disposed/released. It aggregates a function to dispose
// the resource and a handle to a key/id/handle/reference
// that identifies the resource

var DisposeWith = /*#__PURE__*/function () {
  function DisposeWith(dispose, resource) {
    classCallCheck(this, DisposeWith);

    this._dispose = dispose;
    this._resource = resource;
  }

  DisposeWith.prototype.dispose = function dispose() {
    this._dispose(this._resource);
  };

  return DisposeWith;
}();

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
// Aggregate a list of disposables into a DisposeAll
var disposeAll = function disposeAll(ds) {
  return new DisposeAll(ds);
};

// Convenience to aggregate 2 disposables
var disposeBoth = /*#__PURE__*/curry2(function (d1, d2) {
  return disposeAll([d1, d2]);
});

var DisposeAll = /*#__PURE__*/function () {
  function DisposeAll(disposables) {
    classCallCheck(this, DisposeAll);

    this.disposables = disposables;
  }

  DisposeAll.prototype.dispose = function dispose() {
    throwIfErrors(disposeCollectErrors(this.disposables));
  };

  return DisposeAll;
}();

// Dispose all, safely collecting errors into an array


var disposeCollectErrors = function disposeCollectErrors(disposables) {
  return reduce(appendIfError, [], disposables);
};

// Call dispose and if throws, append thrown error to errors
var appendIfError = function appendIfError(errors, d) {
  try {
    d.dispose();
  } catch (e) {
    errors.push(e);
  }
  return errors;
};

// Throw DisposeAllError if errors is non-empty
var throwIfErrors = function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw new DisposeAllError(errors.length + ' errors', errors);
  }
};

// Aggregate Error type for DisposeAll
var DisposeAllError = /*#__PURE__*/function (_extendableBuiltin2) {
  inherits(DisposeAllError, _extendableBuiltin2);

  function DisposeAllError(message, errors) {
    classCallCheck(this, DisposeAllError);

    var _this = possibleConstructorReturn(this, _extendableBuiltin2.call(this, message));

    _this.message = message;
    _this.name = _this.constructor.name;
    _this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(_this, _this.constructor);
    }

    _this.stack = '' + _this.stack + formatErrorStacks(_this.errors);
    return _this;
  }

  DisposeAllError.prototype.toString = function toString() {
    return this.stack;
  };

  return DisposeAllError;
}( /*#__PURE__*/_extendableBuiltin(Error));

var formatErrorStacks = function formatErrorStacks(errors) {
  return reduce(formatErrorStack, '', errors);
};

var formatErrorStack = function formatErrorStack(s, e, i) {
  return s + ('\n[' + (i + 1) + '] ' + e.stack);
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */
// Try to dispose the disposable.  If it throws, send
// the error to sink.error with the provided Time value
var tryDispose = /*#__PURE__*/curry3(function (t, disposable, sink) {
  try {
    disposable.dispose();
  } catch (e) {
    sink.error(t, e);
  }
});

/** @license MIT License (c) copyright 2010-2017 original author or authors */

export { dispose, disposeNone, disposeWith, disposeOnce, disposeAll, disposeBoth, DisposeAllError, tryDispose };
//# sourceMappingURL=index.es.js.map
