/**
 * @type {string}
 */
const pathname = process.argv.slice(1)[0];
/**
 * @type {{[filename: string]: string[]}}
 */
const relationModuleFilenames = {};
/**
 * @type {string[]}
 */
const aliveFilenames = [pathname];

const Module = require('node:module');
// noinspection JSUnresolvedReference
const oldLoad = Module._load;
Module._load = function (request, parent, isMain) {
  const loaded = oldLoad.call(this, request, parent, isMain);
  if (parent && !/node_modules/.test(parent.filename) && !/package\\tsxx\\/.test(parent.filename)) {
    const { filename, children } = parent;
    if (!aliveFilenames.includes(filename)) {
      aliveFilenames.push(filename);
    }
    /**
     * @type {string[]}
     */
    const newFilenames = children.map(child => {
      if (!aliveFilenames.includes(child.filename)) {
        aliveFilenames.push(child.filename);
      }
      return child.filename;
    });
    if (!relationModuleFilenames[filename]) {
      relationModuleFilenames[filename] = newFilenames;
    } else {
      /**
       * @type {string[]}
       */
      const oldFilenames = relationModuleFilenames[filename];
      relationModuleFilenames[filename] = [...new Set([...newFilenames, ...oldFilenames])];
    }
  }

  return loaded;
};

const cleanModuleCache = filename => {
  // noinspection JSUnresolvedReference
  delete Module._cache[filename];
  delete relationModuleFilenames[filename];
  aliveFilenames.splice(aliveFilenames.indexOf(filename), 1);
  for (const parentFilename in relationModuleFilenames) {
    const developFilenames = relationModuleFilenames[parentFilename];
    if (developFilenames.includes(filename)) {
      cleanModuleCache(parentFilename);
    }
  }
};

const { Debounce } = require('./util.js');
const { hookServices, unblocks } = require('./hmr-hook.js');
hookServices();
const debouncedFunc = new Debounce(freshFilename => {
  unblocks().then(() => {
    cleanModuleCache(freshFilename);
    try {
      aliveFilenames.push(pathname);
      require(pathname);
    } catch (e) {
      console.error(e);
    }
  });
}, 500);

/**
 * watch file change
 */
const chokidar = require('chokidar');
chokidar.watch(process.cwd()).on('change', freshFilename => {
  if (aliveFilenames.includes(freshFilename)) {
    debouncedFunc.call(freshFilename);
  }
});
