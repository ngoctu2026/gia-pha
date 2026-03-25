import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const skipDirs = new Set(["node_modules", ".next", ".git", "out", "build"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function existsAliasTarget(aliasPath) {
  const base = path.join(root, aliasPath);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
  ];
  return candidates.some((p) => fs.existsSync(p));
}


const criticalFiles = [
  "utils/gedcom.ts",
  "utils/supabase/client.ts",
  "hooks/usePanZoom.ts",
  "utils/eventHelpers.ts",
];

const missingCritical = criticalFiles.filter((f) => !fs.existsSync(path.join(root, f)));
if (missingCritical.length > 0) {
  console.error("❌ Missing critical files required by current app:");
  for (const f of missingCritical) console.error(` - ${f}`);
  console.error("👉 Branch/commit hiện tại có thể chưa được cập nhật đầy đủ.");
  process.exit(1);
}

const files = walk(root);
const missing = [];
const importRegex = /(?:from\s+["']@\/([^"']+)["'])|(?:import\(["']@\/([^"']+)["']\))/g;

for (const file of files) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");

  for (const match of text.matchAll(importRegex)) {
    const alias = match[1] || match[2];
    if (!alias) continue;
    if (!existsAliasTarget(alias)) {
      missing.push(`${rel} -> @/${alias}`);
    }
  }
}

if (missing.length > 0) {
  console.error("❌ Missing alias targets:");
  console.error("👉 Có vẻ bạn đang build từ commit chưa chứa đủ file tiện ích. Hãy merge/redeploy commit mới nhất rồi chạy lại.");
  for (const m of missing) console.error(` - ${m}`);
  process.exit(1);
}

console.log("✅ No missing @/ alias imports found.");
