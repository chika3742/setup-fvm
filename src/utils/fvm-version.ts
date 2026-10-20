import * as exec from "@actions/exec";

const FVM_REPO_URL = "https://github.com/btwld/fvm";

const parse = (v: string) => v.split(".").map(Number);

/**
 * Pick the highest stable version from tag names that matches the given spec.
 *
 * @param spec "4", "4.x", "4.1", "4.1.x" or an exact version such as "4.1.2".
 * @param tags Tag names (e.g. "v4.1.2", "4.1.2"). Pre-releases are ignored.
 */
export const pickVersion = (spec: string, tags: string[]): string | undefined => {
  const prefix = spec.replace(/^v/, "").replace(/(\.x)+$/, "");
  return tags
    .map((tag) => tag.replace(/^v/, ""))
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && (v === prefix || v.startsWith(`${prefix}.`)))
    .sort((a, b) => {
      const [pa, pb] = [parse(a), parse(b)];
      return pa[0]! - pb[0]! || pa[1]! - pb[1]! || pa[2]! - pb[2]!;
    })
    .at(-1);
}

/**
 * Resolve the `fvm-version` input to an exact version that the FVM install script accepts.
 * Returns undefined for "latest" so that the install script picks the latest release.
 */
export const resolveFvmVersion = async (spec: string): Promise<string | undefined> => {
  if (spec === "latest") {
    return undefined;
  }
  if (/^v?\d+\.\d+\.\d+/.test(spec)) {
    return spec; // exact version, including pre-releases
  }

  const { stdout } = await exec.getExecOutput("git", ["ls-remote", "--tags", "--refs", FVM_REPO_URL], { silent: true });
  const tags = stdout.split("\n").map((line) => line.split("refs/tags/")[1] ?? "");
  const version = pickVersion(spec, tags);
  if (!version) {
    throw new Error(`No FVM release matches "${spec}".`);
  }
  return version;
}
