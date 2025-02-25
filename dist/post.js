// src/main.ts
import * as core from "@actions/core";
import * as cache from "@actions/cache";
import * as glob from "@actions/glob";
import * as exec from "@actions/exec";
import * as path from "path";
import * as fs from "fs/promises";
import * as os from "node:os";
var getFlutterVersion = async (workingDirectory) => {
  const fvmrcPath = path.resolve(process.env.GITHUB_WORKSPACE, workingDirectory, ".fvmrc");
  const fvmrcContent = await fs.readFile(fvmrcPath, "utf-8");
  return JSON.parse(fvmrcContent).flutter;
};
var getCacheKeys = async (workingDirectory) => {
  const runnerOs = process.env.RUNNER_OS;
  return {
    flutterSdkCacheKey: `${runnerOs}-flutter-${await getFlutterVersion(workingDirectory)}`,
    flutterSdkRestoreCacheKeys: [`${runnerOs}-flutter-`],
    pubCacheKey: `${runnerOs}-pub-${await glob.hashFiles("**/pubspec.lock", workingDirectory)}`,
    pubRestoreCacheKeys: [`${runnerOs}-pub-`]
  };
};
var tryExec = async (commandLine) => {
  const retryCount = 3;
  let trial = 1;
  while (true) {
    const exitCode = await exec.exec(commandLine);
    if (exitCode === 0) {
      return;
    }
    console.error(`Failed to execute "${commandLine}". Retrying...(${trial} of ${retryCount})`);
    trial++;
  }
};
var installFvm = () => {
  return tryExec("curl -fsSL https://fvm.app/install.sh | bash");
};
var main = async () => {
  try {
    const workingDirectory = core.getInput("working-directory");
    const flutterVersion = await getFlutterVersion(workingDirectory);
    if (!cache.isFeatureAvailable()) {
      core.setFailed("Cache is not available");
    }
    const cacheKeys = await getCacheKeys(workingDirectory);
    await cache.restoreCache([`${os.homedir()}/.fvm/versions/${flutterVersion}`, `${os.homedir()}/.fvm/cache.git`], cacheKeys.flutterSdkCacheKey, cacheKeys.flutterSdkRestoreCacheKeys);
    await cache.restoreCache([`${os.homedir()}/.pub-cache`], cacheKeys.pubCacheKey, cacheKeys.pubRestoreCacheKeys);
    await installFvm();
    const fvmUseExitCode = await exec.exec("fvm use");
    core.saveState("fvm-use-success", fvmUseExitCode === 0);
  } catch (e) {
    core.setFailed(e.message);
  }
};
await main();

// src/post.ts
import * as core2 from "@actions/core";
import * as cache2 from "@actions/cache";
var main2 = async () => {
  try {
    const fvmUseSuccess = core2.getState("fvm-use-success");
    if (fvmUseSuccess === "false") {
      core2.info("Saving cache is skipped because initializing FVM failed.");
    }
    const homeDir = process.env.HOME;
    const workingDirectory = core2.getInput("working-directory");
    const cacheKeys = await getCacheKeys(workingDirectory);
    const flutterVersion = await getFlutterVersion(workingDirectory);
    await cache2.saveCache([`${homeDir}/.fvm/versions/${flutterVersion}`, `${homeDir}/.fvm/cache.git`], cacheKeys.flutterSdkCacheKey);
    await cache2.saveCache([`${homeDir}/.pub-cache`], cacheKeys.pubCacheKey);
  } catch (e) {
    core2.setFailed(e.message);
  }
};
await main2();
