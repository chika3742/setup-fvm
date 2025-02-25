import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { getCacheKeys, getFlutterVersion } from "./main.ts";

const main = async () => {
  try {
    const fvmUseSuccess = core.getState("fvm-use-success");
    if (fvmUseSuccess !== "true") {
      core.info("Saving cache is skipped because initializing FVM failed.");
      return;
    }

    const homeDir = process.env.HOME;

    const workingDirectory = core.getInput('working-directory');
    const cacheKeys = await getCacheKeys(workingDirectory);
    const flutterVersion = await getFlutterVersion(workingDirectory);

    // save Flutter SDK cache
    await cache.saveCache(
      [`${homeDir}/.fvm/versions/${flutterVersion}`, `${homeDir}/.fvm/cache.git`],
      cacheKeys.flutterSdkCacheKey,
    );

    // save pub cache
    await cache.saveCache(
      [`${homeDir}/.pub-cache`],
      cacheKeys.pubCacheKey,
    );
  } catch (e) {
    core.setFailed((e as any).message);
  }
}

await main();
