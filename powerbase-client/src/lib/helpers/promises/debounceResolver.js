import DebouncePromise from './debounce';
import onlyResolvesLast from './resolveLastPromise';

const DefaultOptions = {
  key() {
    const _args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      // eslint-disable-next-line no-underscore-dangle
      _args[_i] = arguments[_i];
    }
    return null;
  },
  onlyResolvesLast: true,
};

const DebounceCache = (function () {
  class DebounceCache {
    constructor(config) {
      this.config = config;
      this.debounceSingleton = null;
      this.debounceCache = {};
    }

    // eslint-disable-next-line no-underscore-dangle
    _createDebouncedFunction() {
      let debouncedFunc = DebouncePromise(
        this.config.func,
        this.config.wait,
        this.config.options,
      );
      if (this.config.options.onlyResolvesLast) {
        debouncedFunc = onlyResolvesLast(debouncedFunc);
      }
      return {
        func: debouncedFunc,
      };
    }

    getDebouncedFunction(args) {
      let _a;
      const key = (_a = this.config.options).key.apply(_a, args);
      if (key === null || typeof key === 'undefined') {
        if (!this.debounceSingleton) {
          this.debounceSingleton = this._createDebouncedFunction();
        }
        return this.debounceSingleton;
      }
      if (!this.debounceCache[key]) {
        this.debounceCache[key] = this._createDebouncedFunction();
      }
      return this.debounceCache[key];
    }
  }
  return DebounceCache;
}());

export default function debounceResolve(func, wait, options) {
  const finalOptions = { ...DefaultOptions, ...options };
  const debounceCache = new DebounceCache({
    func,
    wait,
    options: finalOptions,
  });
  const debounceResolveWrapper = function () {
    const args = [];
    for (let _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    const debouncedFn = debounceCache.getDebouncedFunction(args).func;
    return debouncedFn.apply(void 0, args);
  };
  return debounceResolveWrapper;
}
