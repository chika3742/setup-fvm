import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as glob from '@actions/glob';
import * as exec from '@actions/exec';
import * as path from "path";
import * as fs from "fs/promises";
import * as os from "node:os";

export const getFlutterVersion = async (workingDirectory: string): Promise<string> => {
  const fvmrcPath = path.resolve(process.env.GITHUB_WORKSPACE!, workingDirectory, '.fvmrc');
  const fvmrcContent = await fs.readFile(fvmrcPath, 'utf-8');
  return JSON.parse(fvmrcContent).flutter;
}

interface CacheKeys {
  flutterSdkCacheKey: string;
  flutterSdkRestoreCacheKeys: string[];
  pubCacheKey: string;
  pubRestoreCacheKeys: string[];
}

export const getCacheKeys = async (workingDirectory: string): Promise<CacheKeys> => {
  const runnerOs = process.env.RUNNER_OS;
  return {
    flutterSdkCacheKey: `${runnerOs}-flutter-${await getFlutterVersion(workingDirectory)}`,
    flutterSdkRestoreCacheKeys: [`${runnerOs}-flutter-`],
    pubCacheKey: `${runnerOs}-pub-${await glob.hashFiles("**/pubspec.lock", workingDirectory)}`,
    pubRestoreCacheKeys: [`${runnerOs}-pub-`],
  }
}

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
  const result = await Bun.fetch("https://fvm.app/install.sh")
  const buffer = await result.arrayBuffer()
  return tryExec("bash", { input: Buffer.from(buffer) });
}

const main = async () => {
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

await main();
