import path from "path";
import fs from "fs/promises";
import * as glob from "@actions/glob";

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
  const workspaceDir = process.env.GITHUB_WORKSPACE!;
  return {
    flutterSdkCacheKey: `${runnerOs}-flutter-${await getFlutterVersion(workingDirectory)}`,
    flutterSdkRestoreCacheKeys: [`${runnerOs}-flutter-`],
    pubCacheKey: `${runnerOs}-pub-${await glob.hashFiles("**/pubspec.lock", path.resolve(workspaceDir, workingDirectory))}`,
    pubRestoreCacheKeys: [`${runnerOs}-pub-`],
  }
}
