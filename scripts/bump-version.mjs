import fs from "fs";

const type = process.argv[2] || "patch";
if (!["patch", "minor", "major"].includes(type)) {
  console.error("Usage: node scripts/bump-version.mjs [patch|minor|major]");
  process.exit(1);
}

const pkgPath = "./package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
let [major, minor, patch] = pkg.version.split(".").map(Number);

if (type === "major") { major++; minor = 0; patch = 0; }
else if (type === "minor") { minor++; patch = 0; }
else { patch++; }

const newVer = `${major}.${minor}.${patch}`;
pkg.version = newVer;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const versionTsPath = "./src/lib/version.ts";
let versionTs = fs.readFileSync(versionTsPath, "utf-8");
versionTs = versionTs.replace(/APP_VERSION = "[^"]+"/, `APP_VERSION = "${newVer}"`);
fs.writeFileSync(versionTsPath, versionTs);

console.log(`Bumped ${type}: ${pkg.version} -> ${newVer}`);
console.log(`Next: git add package.json src/lib/version.ts && git commit -m "chore: bump v${newVer}" && git tag v${newVer} && git push origin main --tags`);
