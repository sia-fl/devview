class Debouncer {
  constructor(func, delay) {
    this.func = func;
    this.delay = delay;
    this.timeout = null;
  }

  call(filename) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.func(filename);
    }, this.delay);
  }
}

module.exports.Debouncer = Debouncer;
