import { test, expect } from 'vitest';
// @ts-ignore
import { getSpawnArgs, Debounce, getLoaderArgs, getPackageGlobHmrFiles } from './util.js';
import * as path from 'path';

test('get package glob hmr files', () => {
  let cwd = path.join(__dirname, '/test/glob');
  const files = getPackageGlobHmrFiles(cwd);
  expect(files).toEqual([
    path.join(cwd, 'src/demo03.ts'),
    path.join(cwd, 'src/demo02.js'),
    path.join(cwd, 'src/demo01.js')
  ]);
});

test('get new spawn args', () => {
  const loaderArgs = getLoaderArgs();
  const newArgs = getSpawnArgs(['---', 'xxx', '--loader', 'someJsFile.js']);
  expect(newArgs).toEqual(['---', 'xxx', ...loaderArgs, '--loader', 'someJsFile.js']);
});

test('debounce', () => {
  const num = {
    count: 1
  };
  const call = new Debounce(() => {
    num.count++;
  }, 100);
  call.call();
  call.call();
  call.call();
  expect(num.count).toBe(1);
});
