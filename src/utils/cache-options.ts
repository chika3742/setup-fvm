import path from "path";
import fs from "fs/promises";
import * as glob from "@actions/glob";

const homeDir = process.env.HOME!;
const runnerOs = process.env.RUNNER_OS!;
const workspaceDir = process.env.GITHUB_WORKSPACE!;

/**
 * Get the version of Flutter from `.fvmrc` file.
 *
 * @param fvmrcPath Path of `.fvmrc` file relative to repository root.
 */
export const getFlutterVersion = async (fvmrcPath: string): Promise<string> => {
  const workspaceDir = process.env.GITHUB_WORKSPACE!;
  fvmrcPath = path.resolve(workspaceDir, fvmrcPath);
  const fvmrcContent = await fs.readFile(fvmrcPath, 'utf-8');
  return JSON.parse(fvmrcContent).flutter;
}

export interface CacheOptions {
  paths: string[];
  cacheKey: string;
  restoreKeys: string[];
}

interface Caches {
  flutterSdk: CacheOptions;
  pub: CacheOptions;
}

/**
 * Get cache keys for Flutter SDK and Pub cache.
 *
 * @param flutterProjectDir The root directory path of Flutter project relative to repository root.
 * @param flutterVersion The version of Flutter (e.g. `3.29.0`)
 */
export const getCacheOptions = async (flutterProjectDir: string, flutterVersion: string): Promise<Caches> => {
  const pubspecHash = await glob.hashFiles("**/pubspec.lock", path.resolve(workspaceDir, flutterProjectDir));
  return {
    flutterSdk: {
      paths: [
        path.join(homeDir, "fvm/versions", flutterVersion),
        path.join(homeDir, "fvm/cache.git"),
      ],
      cacheKey: `${runnerOs}-flutter-${flutterVersion}`,
      restoreKeys: [`${runnerOs}-flutter-`],
    },
    pub: {
      paths: [path.join(homeDir, ".pub-cache")],
      cacheKey: `${runnerOs}-pub-${pubspecHash}`,
      restoreKeys: [`${runnerOs}-pub-`],
    }
  }
}
