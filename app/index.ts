// IMPORTANT!!! this file is not under use

import { spawn } from "child_process";
import { join } from "path";

const genPy = spawn("electron", ["."], {
  cwd: join(__dirname, ".."),
  detached: true,
  // stdio: process.env.NODE_ENV ? "ignore" : "inherit"
  stdio: "ignore"
});

genPy.unref();
