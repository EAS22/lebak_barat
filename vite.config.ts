import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

export default defineConfig(() => {
  const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  let commit = "dev";
  try {
    commit = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {}
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
      __GIT_COMMIT__: JSON.stringify(commit),
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
  };
});
