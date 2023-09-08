const url = require('url');
const path = require('path');
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

const getPackageGlobHmrFiles = (cwd = undefined) => {
  if (!cwd) {
    cwd = process.cwd();
  }
  const packageJson = path.join(cwd, 'package.json');
  /**
   * @type {Record<string, any>}
   */
  const packageJsonObj = require(packageJson);
  /**
   * @type {string[]}
   */
  const hmrGlobs = packageJsonObj.hmrGlobs || [];
  const hmrFiles = [];
  if (hmrGlobs.length) {
    const { globSync } = require('glob');
    const globFiles = globSync(hmrGlobs, { cwd, ignore: 'node_modules/**' });
    for (const globFile of globFiles) {
      const fullPath = path.join(cwd, globFile);
      hmrFiles.push(fullPath);
    }
  }
  return hmrFiles;
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

module.exports.getPackageGlobHmrFiles = getPackageGlobHmrFiles;
