import fs from "fs";
import path from "path";
import blessed from "blessed";
import { fileURLToPath } from "url";
import { runScript } from "./utils/run-script.ts";
import { askArgs } from "./tui/ask-args.ts";
import { getJsDocParams } from "./utils/get-js-doc-params.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPTS_DIR = path.resolve(__dirname, "../scripts");

async function main() {
  if (!fs.existsSync(SCRIPTS_DIR)) {
    console.error("No 'scripts' folder found.");
    process.exit(1);
  }

  const scripts = fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith(".ts"));

  if (scripts.length === 0) {
    console.log("No .ts scripts found in 'scripts' folder.");
    process.exit(0);
  }

  // Create screen
  const screen = blessed.screen({
    smartCSR: true,
    title: "Script Runner",
  });

  // Instruction box
  const instructions = blessed.box({
    top: 0,
    left: "center",
    width: "100%",
    height: 1,
    content: "↑/↓ navigate | SPACE select | ENTER run | q quit",
    style: { fg: "yellow" },
  });

  // Script list
  const list = blessed.list({
    top: 1,
    left: "center",
    width: "100%",
    height: "100%-1",
    keys: true,
    mouse: true,
    vi: true,
    items: scripts.map((s) => `[ ] ${s}`),
    style: {
      selected: { bg: "blue", fg: "white" },
      item: { fg: "white" },
    },
  });

  const logBox = blessed.log({
    parent: screen,
    bottom: 0,
    height: "50%",
    width: "100%",
    border: "line",
    label: "Logs",
    scrollable: true,
    alwaysScroll: true,
    scrollbar: { ch: " " },
  });

  screen.append(instructions);
  screen.append(list);
  screen.append(logBox);
  list.focus();

  // Track selections
  const selected = new Set<number>();

  // SPACE toggles selection
  list.key("space", () => {
    const idx = (list as any).selected;
    if (selected.has(idx)) {
      selected.delete(idx);
      list.setItem(idx, `[ ] ${scripts[idx]}`);
    } else {
      selected.add(idx);
      list.setItem(idx, `[x] ${scripts[idx]}`);
    }
    screen.render();
  });

  // ENTER runs scripts
  list.key("enter", async () => {
    const toRun =
      selected.size > 0
        ? [...selected].map((i) => scripts[i])
        : [scripts[(list as any).selected]];

    const scriptsMap = new Map();
    for (const script of toRun) {
      if (!script) continue;

      const scriptPath = path.join(SCRIPTS_DIR, script);
      const argNames = getJsDocParams(scriptPath);
      let args: string[] = [];

      if (argNames.length > 0) {
        args = await askArgs(screen, script, argNames);
      }

      scriptsMap.set(script, {
        scriptPath,
        args,
      });
    }

    for (const script of scriptsMap.values()) {
      try {
        logBox.log(`\n▶ Running ${script.scriptPath}...\n`);
        await runScript(script.scriptPath, script.args);
      } catch (err) {
        if (err instanceof Error) logBox.log(err.message);
      }
    }

    logBox.log("\n✅ Done.");
  });

  // Quit with q or Ctrl+C
  screen.key(["q", "C-c"], () => process.exit(0));

  screen.render();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
