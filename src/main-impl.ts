import * as core from '@actions/core';
import * as cache from '@actions/cache';
import * as exec from '@actions/exec';
import { type CacheOptions, getCacheOptions, getFlutterVersion } from "./utils/cache-options.ts";
import { execWithRetry } from "./utils/exec-with-retry.ts";
import * as path from "path";

const workspaceDir = process.env.GITHUB_WORKSPACE!;

const installFvm = async (): Promise<void> => {
  const result = await fetch("https://fvm.app/install.sh")
  const buffer = await result.arrayBuffer()
  await execWithRetry("bash", { input: Buffer.from(buffer) }, "Failed to install FVM.");
  core.addPath(path.join(process.env.HOME!, "fvm/bin"))
}

const restoreCache = async (options: CacheOptions, stateKey: string) => {
  const cacheHit = await cache.restoreCache(
    options.paths,
    options.cacheKey,
    options.restoreKeys,
  );
  if (!cacheHit) {
    core.info("No cache found");
    return;
  }
  core.saveState(`${stateKey}-cache-hit`, cacheHit);
  core.setOutput(`${stateKey}-cache-hit`, cacheHit);
}

export const mainRun = async () => {
  try {
    // inputs
    const projectDir = core.getInput("project-dir");
    const cacheEnabled = core.getInput("cache") === "true";

    // restore caches
    if (cacheEnabled) {
      if (!cache.isFeatureAvailable()) {
        core.setFailed('Caching feature is not available');
        return;
      }

      // log group
      const flutterVersion = await getFlutterVersion(projectDir);
      const cacheOptions = await getCacheOptions(projectDir, flutterVersion);

      // restore Flutter SDK cache
      await core.group("Restore Flutter SDK cache", () => {
        return restoreCache(cacheOptions.flutterSdk, "flutter");
      })

      // restore pub cache
      await core.group("Restore Pub cache", () => {
        return restoreCache(cacheOptions.pub, "pub");
      })
    }

    await core.group("Install FVM", installFvm);

    // install Flutter SDK and Pub dependencies
    await core.group("Run fvm use", async () => {
      const fvmUseExitCode = await exec.exec("fvm use --skip-pub-get", [], {
        cwd: path.join(workspaceDir, projectDir),
      });
      const pubGetExitCode = await exec.exec("fvm flutter pub get --enforce-lockfile", [], {
        cwd: path.join(workspaceDir, projectDir),
      });
      core.saveState("fvm-use-success", fvmUseExitCode === 0 && pubGetExitCode === 0);
    })
  } catch (e) {
    core.setFailed((e as any).message);
  }
}
