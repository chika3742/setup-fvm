import * as exec from "@actions/exec";

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Exec a command. If the process exits with a non-zero code, retry the command.
 *
 * @param commandLine Command line to exec.
 * @param options {@link exec.ExecOptions} to pass to {@link exec.exec}.
 * @param retryCount How many times to retry the command.
 * @param retryInterval Interval in seconds between retries.
 */
export const execWithRetry = async (commandLine: string, options: exec.ExecOptions, retryCount = 3, retryInterval = 10) => {
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
    await sleep(retryInterval * 1000);
    trial++;
  }
}
