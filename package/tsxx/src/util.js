const url = require('url');
const loaders = ['./hmr.mjs', './loaders/loader-block.mjs'];
const getLoaderUrl = loader => url.pathToFileURL(require.resolve(loader)).toString();

const getLoaderArgs = () => {
  const args = [];
  for (const loader of loaders) {
    args.push('--loader', getLoaderUrl(loader));
  }
  return args;
};

const getSpawnArgs = oldArgs => {
  const newArgs = [...oldArgs];
  const index = newArgs.findIndex(arg => arg === '--loader');
  if (index !== -1) {
    newArgs.splice(index, 0, ...getLoaderArgs());
  }
  return newArgs;
};

class Debounce {
  constructor(func, delay) {
    this.func = func;
    this.delay = delay;
    this.timeout = null;
  }

  call(...args) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.func(...args);
    }, this.delay);
  }
}

module.exports.Debounce = Debounce;

module.exports.getSpawnArgs = getSpawnArgs;

module.exports.getLoaderArgs = getLoaderArgs;
