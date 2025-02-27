import path from "path";
import fs from "fs/promises";
import * as glob from "@actions/glob";

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

interface CacheKeys {
  flutterSdkCacheKey: string;
  flutterSdkRestoreCacheKeys: string[];
  pubCacheKey: string;
  pubRestoreCacheKeys: string[];
}

/**
 * Get cache keys for Flutter SDK and Pub cache.
 *
 * @param flutterProjectDir The root directory path of Flutter project relative to repository root.
 * @param flutterVersion The version of Flutter (e.g. `3.29.0`)
 */
export const getCacheKeys = async (flutterProjectDir: string, flutterVersion: string): Promise<CacheKeys> => {
  const runnerOs = process.env.RUNNER_OS;
  const workspaceDir = process.env.GITHUB_WORKSPACE!;
  return {
    flutterSdkCacheKey: `${runnerOs}-flutter-${flutterVersion}`,
    flutterSdkRestoreCacheKeys: [`${runnerOs}-flutter-`],
    pubCacheKey: `${runnerOs}-pub-${await glob.hashFiles("**/pubspec.lock", path.resolve(workspaceDir, flutterProjectDir))}`,
    pubRestoreCacheKeys: [`${runnerOs}-pub-`],
  }
}
