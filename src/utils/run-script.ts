import path from "path";

export async function runScript(
  scriptPath: string,
  args: string[] = [],
): Promise<void> {
  const fullPath = path.resolve(scriptPath);
  const module = await import(fullPath);
  if (typeof module.main === "function") {
    await module.main(...args);
  } else {
    throw new Error(`Script ${scriptPath} does not export a main() function`);
  }
}
