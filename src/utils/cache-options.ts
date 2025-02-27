import path from "path";
import fs from "fs/promises";
import * as glob from "@actions/glob";

const homeDir = process.env.HOME!;
const runnerOs = process.env.RUNNER_OS!;
const workspaceDir = process.env.GITHUB_WORKSPACE!;

/**
 * Get the version of Flutter from `.fvmrc` file.
 *
 * @param projectDir Relative path to the project root.
 */
export const getFlutterVersion = async (projectDir: string): Promise<string> => {
  const fvmrcPath = path.join(workspaceDir, projectDir, ".fvmrc");
  let fvmrcContent: string;
  // read the content of .fvmrc
  try {
    fvmrcContent = await fs.readFile(fvmrcPath, 'utf-8');
  } catch (e) {
    throw new Error("Failed to read .fvmrc file. Make sure project-dir is set properly.", { cause: e });
  }
  // parse fvmrc and return the version
  try {
    return JSON.parse(fvmrcContent).flutter;
  } catch (e) {
    throw new Error("Failed to parse .fvmrc. Make sure the file is valid JSON.", { cause: e });
  }
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
 * @param projectDir The root directory path of Flutter project relative to repository root.
 * @param flutterVersion The version of Flutter (e.g. `3.29.0`)
 */
export const getCacheOptions = async (projectDir: string, flutterVersion: string): Promise<Caches> => {
  const pubspecHash = await glob.hashFiles("**/pubspec.lock", path.join(workspaceDir, projectDir));
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
