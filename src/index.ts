#!/usr/bin/env node
export { JsonPlaceholderReplacer } from "./library";
import * as fs from "fs";
import { commandLineExecution } from "./command-line";

if (require.main === module) {
  const stdinBuffer = fs.readFileSync(process.stdin.fd);
  commandLineExecution(fs, process.argv, stdinBuffer);
}
