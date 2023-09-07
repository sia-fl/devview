#!/usr/bin/env node
const url = require('url');
const hmrScript = url.pathToFileURL(require.resolve('./hmr.mjs')).toString();

const childProcess = require('child_process');
const oldSpawn = childProcess.spawn;
// noinspection JSValidateTypes
childProcess.spawn = (command, args, options) => {
  const newArgs = [...args];
  const index = newArgs.findIndex(arg => arg === '--loader');
  if (index !== -1) {
    newArgs.splice(index, 0, '--loader', hmrScript);
  }
  return oldSpawn.call(this, command, newArgs, options);
};
import('tsx/cli');
