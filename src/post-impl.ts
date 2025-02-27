import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { getCacheKeys, getFlutterVersion } from "./utils/cache-keys.ts";
import path from "path";

export const postRun = async () => {
  try {
    if (core.getInput("cache") !== "true") {
      return;
    }

    const fvmUseSuccess = core.getState("fvm-use-success");
    if (fvmUseSuccess !== "true") {
      core.info("Saving cache is skipped because initializing FVM failed.");
      return;
    }

    const homeDir = process.env.HOME!;

    const fvmrcPath = core.getInput('fvmrc-path');
    const projectDir = core.getInput('project-dir');
    const flutterVersion = await getFlutterVersion(fvmrcPath);
    const cacheKeys = await getCacheKeys(projectDir, flutterVersion);

    // save Flutter SDK cache
    await cache.saveCache(
      [
        path.join(homeDir, "fvm/versions", flutterVersion),
        path.join(homeDir, "fvm/cache.git"),
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
