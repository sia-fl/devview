/**
 * require unblocks in any code before
 */
const { unblocks } = require('./hmr-hook.js');
/**
 * check pathname
 */
const pathname = process.argv.slice(1)[0];
/**
 * @type {{ [filename: string]: string[] }}
 */
let relationModuleFilenames = {};
/**
 * @type {string[]}
 */
let aliveFilenames = [pathname];

let Module = require('node:module');
// noinspection JSUnresolvedReference
let oldLoad = Module._load;
Module._load = function (request, parent, isMain) {
  const loaded = oldLoad.call(this, request, parent, isMain);
  if (
    parent &&
    !/node_modules/.test(parent.filename) &&
    !/package\\modmgr\\src\\hmr-proxy.cjs/.test(parent.filename)
  ) {
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

const clear = filename => {
  // noinspection JSUnresolvedReference
  delete Module._cache[filename];
  delete relationModuleFilenames[filename];
  aliveFilenames.splice(aliveFilenames.indexOf(filename), 1);
  for (const parentFilename in relationModuleFilenames) {
    const developFilenames = relationModuleFilenames[parentFilename];
    if (developFilenames.includes(filename)) {
      clear(parentFilename);
    }
  }
};

const reload = freshFilename => {
  if (/node_modules/.test(freshFilename)) {
    return null;
  }
  unblocks();
  clear(freshFilename);
  require(pathname);
};

const { Debouncer } = require('./util');
const debouncedFunc = new Debouncer(freshFilename => {
  if (aliveFilenames.includes(freshFilename)) {
    reload(freshFilename);
  }
}, 500);

/**
 * watch file change
 */
const chokidar = require('chokidar');
chokidar.watch(process.cwd()).on('change', freshFilename => {
  if (!/node_modules/.test(freshFilename) && !/idea/.test(freshFilename)) {
    debouncedFunc.call(freshFilename);
  }
});
