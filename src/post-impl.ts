import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { getCacheKeys, getFlutterVersion } from "./utils/cache-keys.ts";
import path from "path";

export const postRun = async () => {
  try {
    const fvmUseSuccess = core.getState("fvm-use-success");
    if (fvmUseSuccess !== "true") {
      core.info("Saving cache is skipped because initializing FVM failed.");
      return;
    }

    const homeDir = process.env.HOME!;

    const workingDirectory = core.getInput('working-directory');
    const cacheKeys = await getCacheKeys(workingDirectory);
    const flutterVersion = await getFlutterVersion(workingDirectory);

    // save Flutter SDK cache
    await cache.saveCache(
      [
        path.join(homeDir, ".fvm/versions", flutterVersion),
        path.join(homeDir, ".fvm/cache.git"),
      ],
      cacheKeys.flutterSdkCacheKey,
    ).then(() => {
      core.info(`Flutter SDK cache saved: ${cacheKeys.flutterSdkCacheKey}`);
    });

    // save pub cache
    await cache.saveCache(
      [path.join(homeDir, ".pub-cache")],
      cacheKeys.pubCacheKey,
    ).then(() => {
      core.info(`Pub cache saved: ${cacheKeys.pubCacheKey}`);
    });
  } catch (e) {
    core.setFailed((e as any).message);
  }
}
