import chalk from "chalk";
import path from "path";

export async function runScript(
  scriptPath: string,
  args: string[] = [],
  logFn: (msg: string) => void,
): Promise<void> {
  const fullPath = path.resolve(scriptPath);
  const module = await import(fullPath);
  if (typeof module.main === "function") {
    const originalLog = console.log;
    const originalErr = console.error;
    const originalWarn = console.warn;

    console.log = (...msgs: any[]) => {
      logFn(msgs.join(" "));
    };
    console.error = (...msgs: any[]) => {
      logFn(chalk.red(msgs.join(" ")));
    };
    console.warn = (...msgs: any[]) => {
      logFn(chalk.yellow(msgs.join(" ")));
    };
    try {
      await module.main(...args);
    } finally {
      console.log = originalLog;
      console.error = originalErr;
      console.warn = originalWarn;
    }
  } else {
    throw new Error(`Script ${scriptPath} does not export a main() function`);
  }
}
