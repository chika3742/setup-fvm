import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as exec from '@actions/exec';
import * as os from "node:os";
import { getCacheKeys, getFlutterVersion } from "./utils/cache-keys.ts";

const tryExec = async (commandLine: string, options?: exec.ExecOptions): Promise<void> => {
  const retryCount = 3;

  let trial = 1;

  while (true) {
    const exitCode = await exec.exec(commandLine, [], options);
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
      [`${os.homedir()}/.fvm/versions/${flutterVersion}`, `${os.homedir()}/.fvm/cache.git`],
      cacheKeys.flutterSdkCacheKey,
      cacheKeys.flutterSdkRestoreCacheKeys,
    );

    // restore pub cache
    await cache.restoreCache(
      [`${os.homedir()}/.pub-cache`],
      cacheKeys.pubCacheKey,
      cacheKeys.pubRestoreCacheKeys,
    )

    await installFvm();

    // install Flutter SDK and Pub dependencies
    const fvmUseExitCode = await exec.exec("fvm use");
    core.saveState("fvm-use-success", fvmUseExitCode === 0);
  } catch (e) {
    core.setFailed((e as any).message);
  }
}
