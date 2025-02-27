import * as exec from "@actions/exec";

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Exec a command. If the process exits with a non-zero code, retry the command.
 *
 * @param commandLine Command line to exec.
 * @param options {@link exec.ExecOptions} to pass to {@link exec.exec}.
 * @param failureMessage A message to show when an attempt to execute the command fails. Defaults to "Failed to execute {commandLine}.".
 * @param retryCount How many times to retry the command.
 * @param retryInterval Interval in seconds between retries.
 */
export const execWithRetry = async (commandLine: string, options: exec.ExecOptions, failureMessage?: string, retryCount = 3, retryInterval = 5) => {
  const attemptFailureMessage = failureMessage ?? `Failed to execute "${commandLine}".`;
  let attempt = 1;

  while (true) {
    const exitCode = await exec.exec(commandLine, [], {
      ...options,
      ignoreReturnCode: true,
    });
    if (exitCode === 0) {
      return; // complete function
    }
    if (attempt >= retryCount) {
      throw new Error(`${attemptFailureMessage} in ${retryCount} attempts.`);
    }

    // retry
    attempt++;
    console.error(`${attemptFailureMessage} Retrying...(${attempt} of ${retryCount})`);
    await sleep(retryInterval * 1000); // interval
  }
}
