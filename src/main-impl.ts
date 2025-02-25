import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as exec from '@actions/exec';
import { getCacheKeys, getFlutterVersion } from "./utils/cache-keys.ts";
import path from "path";

const homeDir = process.env.HOME!;

const tryExec = async (commandLine: string, options?: exec.ExecOptions): Promise<void> => {
  const retryCount = 3;

  let trial = 1;

  while (true) {
    const exitCode = await exec.exec(commandLine, [], {
      ...options,
      failOnStdErr: false,
    });
    if (exitCode === 0) {
      return; // complete function
    }
    console.error(`Failed to execute "${commandLine}". Retrying...(${trial} of ${retryCount})`);
    trial++;
  }
}

const installFvm = async (): Promise<void> => {
  const result = await fetch("https://fvm.app/install.sh")
  const buffer = await result.arrayBuffer()
  return tryExec("bash", { input: Buffer.from(buffer) });
}

export const mainRun = async () => {
  try {
    const workingDirectory = core.getInput('working-directory');

    const flutterVersion = await getFlutterVersion(workingDirectory);

    if (!cache.isFeatureAvailable()) {
      core.setFailed('Cache is not available');
    }
    const cacheKeys = await getCacheKeys(workingDirectory);

    // restore Flutter SDK cache
    await cache.restoreCache(
      [
        path.join(homeDir, "fvm/versions", flutterVersion),
        path.join(homeDir, "fvm/cache.git"),
      ],
      cacheKeys.flutterSdkCacheKey,
      cacheKeys.flutterSdkRestoreCacheKeys,
    ).then((cacheHit) => {
      if (cacheHit) {
        core.info(`Flutter SDK cache found for version ${flutterVersion}: ${cacheHit}`);
      } else {
        core.info("No Flutter SDK cache found");
      }
    });

    // restore pub cache
    await cache.restoreCache(
      [path.join(homeDir, ".pub-cache")],
      cacheKeys.pubCacheKey,
      cacheKeys.pubRestoreCacheKeys,
    ).then((cacheHit) => {
      if (cacheHit) {
        core.info(`Pub cache found: ${cacheHit}`);
      } else {
        core.info("No Pub cache found");
      }
    });

    await installFvm();

    // install Flutter SDK and Pub dependencies
    const fvmUseExitCode = await exec.exec("fvm use");
    core.saveState("fvm-use-success", fvmUseExitCode === 0);
  } catch (e) {
    core.setFailed((e as any).message);
  }
}
