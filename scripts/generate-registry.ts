import { writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUT = join(ROOT, "registry.json");

const registry = {
  generated: new Date().toISOString(),
  packages: [] as unknown[],
};

writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log(`registry.json generated (${registry.packages.length} packages)`);
