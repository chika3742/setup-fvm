import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { type CacheOptions, getCacheOptions, getFlutterVersion } from "./utils/cache-options.ts";

const saveCache = async (options: CacheOptions, stateKey: string) => {
  const cacheHit = core.getState(`${stateKey}-cache-hit`);
  if (options.cacheKey === cacheHit) {
    core.info("Skip saving cache as the cache key has not changed.")
    return;
  }
  await cache.saveCache(options.paths, options.cacheKey);
  core.info(`${stateKey} cache saved: ${options.cacheKey}`);
}

export const postRun = async () => {
  try {
    // precondition: ensure caching is enabled
    if (core.getInput("cache") !== "true") {
      return;
    }

    // precondition: ensure fvm install was exited successfully
    const fvmInstallSuccess = core.getState("fvm-install-success");
    if (fvmInstallSuccess !== "true") {
      core.info("Saving cache is skipped because initializing FVM failed.");
      return;
    }

    // inputs
    const projectDir = core.getInput('project-dir');

    const flutterVersion = await getFlutterVersion(projectDir);
    const cacheOptions = await getCacheOptions(projectDir, flutterVersion);

    // save Flutter SDK cache
    await core.group("Save Flutter SDK cache", () => {
      return saveCache(cacheOptions.flutterSdk, "flutter");
    })

    // save pub cache
    await core.group("Save Pub cache", () => {
      return saveCache(cacheOptions.pub, "pub");
    })
  } catch (e) {
    core.setFailed((e as any).message);
  }
}
