import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { Package, Registry, ChangelogEntry } from "./registry-types.js";

const ROOT = process.cwd();
const OUT = join(ROOT, "registry.json");
const NOW = new Date().toISOString();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filePath: string): Record<string, any> {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

/** Derive simple tags from the package directory name and description */
function deriveTags(dirName: string, description: string): string[] {
  const tags: string[] = [];
  // Use the directory name (without -mcp suffix) as a tag
  const base = dirName.replace(/-mcp$/, "");
  tags.push(base);

  // Extract meaningful keywords from description (Korean + English)
  const keywords = description
    .replace(/[^a-zA-Z0-9가-힣\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  for (const kw of keywords) {
    const lower = kw.toLowerCase();
    if (!tags.includes(lower)) {
      tags.push(lower);
    }
  }

  return tags;
}

// ---------------------------------------------------------------------------
// Changelog Parser
// ---------------------------------------------------------------------------

function parseChangelog(dir: string): ChangelogEntry[] | undefined {
  const changelogPath = join(dir, "CHANGELOG.md");
  if (!existsSync(changelogPath)) return undefined;

  const content = readFileSync(changelogPath, "utf-8");
  const entries: ChangelogEntry[] = [];
  let current: ChangelogEntry | null = null;

  for (const line of content.split("\n")) {
    // Match: ## 1.0.0 (2026-02-11)
    const heading = line.match(/^##\s+(\S+)\s*(?:\(([^)]+)\))?/);
    if (heading) {
      if (current) entries.push(current);
      current = {
        version: heading[1],
        date: heading[2] ?? "",
        changes: [],
      };
      continue;
    }
    // Match: - change description
    if (current) {
      const bullet = line.match(/^[-*]\s+(.+)/);
      if (bullet) {
        current.changes.push(bullet[1].trim());
      }
    }
  }
  if (current) entries.push(current);

  // Return only the 3 most recent versions
  return entries.length > 0 ? entries.slice(0, 3) : undefined;
}

// ---------------------------------------------------------------------------
// MCP Scanner
// ---------------------------------------------------------------------------

function scanMcps(): Package[] {
  const mcpDir = join(ROOT, "mcp");
  if (!existsSync(mcpDir)) return [];

  const entries = readdirSync(mcpDir).filter((name) => {
    const full = join(mcpDir, name);
    return (
      name.endsWith("-mcp") &&
      statSync(full).isDirectory() &&
      existsSync(join(full, "package.json"))
    );
  });

  return entries.map((dirName) => {
    const pkgPath = join(mcpDir, dirName, "package.json");
    const pkg = readJson(pkgPath);
    const jetsong = pkg.jetsong ?? {};

    const id = dirName.replace(/-mcp$/, "");
    const description: string = pkg.description ?? "";

    const changelog = parseChangelog(join(mcpDir, dirName));

    return {
      id,
      type: "mcp" as const,
      name: jetsong.displayName ?? dirName,
      description,
      icon: jetsong.icon ?? "",
      version: pkg.version ?? "0.0.0",
      author: "ssssccccchhhhh",
      tags: deriveTags(dirName, description),
      compatibility: jetsong.compatibility ?? {
        "claude-code": false,
        cursor: false,
        codex: false,
        opencode: false,
        antigravity: false,
      },
      envFields: jetsong.envFields,
      tokenType: jetsong.tokenType,
      tokenGuide: jetsong.tokenGuide,
      stats: { installs: 0, stars: 0 },
      changelog,
      createdAt: NOW,
      updatedAt: NOW,
      path: `mcp/${dirName}`,
    };
  });
}

// ---------------------------------------------------------------------------
// Skills Scanner
// ---------------------------------------------------------------------------

function scanSkills(): Package[] {
  const skillsDir = join(ROOT, "skills");
  if (!existsSync(skillsDir)) return [];

  const entries = readdirSync(skillsDir).filter((name) => {
    const full = join(skillsDir, name);
    return (
      statSync(full).isDirectory() &&
      existsSync(join(full, "SKILL.md"))
    );
  });

  return entries.map((dirName) => {
    const skillMdPath = join(skillsDir, dirName, "SKILL.md");
    const skillMd = readFileSync(skillMdPath, "utf-8");
    const { data: frontmatter } = matter(skillMd);

    // Read package.json if it exists (may be created by another agent)
    const pkgJsonPath = join(skillsDir, dirName, "package.json");
    const hasPkgJson = existsSync(pkgJsonPath);
    const pkg = hasPkgJson ? readJson(pkgJsonPath) : {};
    const jetsong = pkg.jetsong ?? {};

    const id = dirName;
    const description: string =
      pkg.description ?? frontmatter.description ?? "";

    // Compatibility: prefer package.json jetsong field, fall back to frontmatter
    const defaultCompat = {
      "claude-code": false,
      cursor: false,
      codex: false,
      opencode: false,
      antigravity: false,
    };
    const compatibility =
      jetsong.compatibility ?? frontmatter.compatibility ?? defaultCompat;

    // Tags: prefer package.json jetsong.tags, fall back to frontmatter
    const tags: string[] =
      jetsong.tags ?? frontmatter.tags ?? [];

    const changelog = parseChangelog(join(skillsDir, dirName));

    return {
      id,
      type: "skill" as const,
      name: jetsong.displayName ?? frontmatter.name ?? dirName,
      description,
      icon: jetsong.icon ?? "",
      version: frontmatter.version ?? pkg.version ?? "0.0.0",
      author: frontmatter.author ?? "ssssccccchhhhh",
      tags,
      compatibility,
      stats: { installs: 0, stars: 0 },
      changelog,
      createdAt: NOW,
      updatedAt: NOW,
      path: `skills/${dirName}`,
    };
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const mcps = scanMcps();
const skills = scanSkills();

const registry: Registry = {
  generated: NOW,
  packages: [...mcps, ...skills],
};

writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log(`registry.json generated (${registry.packages.length} packages: ${mcps.length} MCP, ${skills.length} skills)`);
