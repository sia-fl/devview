import { getHookHttpUrl, getHookNetUrl } from './util.js';

// noinspection JSUnusedGlobalSymbols
export async function resolve(specifier, context, defaultResolve) {
  if (context.conditions.includes('import')) {
    if (specifier === 'net') {
      specifier = getHookNetUrl;
    } else if (specifier === 'http') {
      specifier = getHookHttpUrl;
    }
  }
  return defaultResolve(specifier, context, defaultResolve);
}
