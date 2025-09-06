import fs from "node:fs";
import { parse } from "comment-parser";

export function getJsDocParams(scriptPath: string): string[] {
  const content = fs.readFileSync(scriptPath, "utf-8");
  const comments = parse(content);
  if (comments.length === 0) return [];
  const first = comments[0];

  if (!first) return [];

  return first.tags.filter((t) => t.tag === "param").map((t) => t.name);
}
