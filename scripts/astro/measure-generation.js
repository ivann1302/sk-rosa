import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "public_html_astro");
const pollIntervalMs = 100;

function processTable() {
  const result = spawnSync("ps", ["-eo", "pid=,ppid=,rss="], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .trim()
    .split("\n")
    .map(line => line.trim().split(/\s+/).map(Number))
    .filter(([pid, ppid, rss]) => Number.isFinite(pid) && Number.isFinite(ppid) && Number.isFinite(rss))
    .map(([pid, ppid, rss]) => ({ pid, ppid, rss }));
}

function descendantPids(rootPid, rows) {
  const childrenByParent = new Map();

  for (const row of rows) {
    if (!childrenByParent.has(row.ppid)) {
      childrenByParent.set(row.ppid, []);
    }

    childrenByParent.get(row.ppid).push(row.pid);
  }

  const pids = new Set([rootPid]);
  const queue = [rootPid];

  while (queue.length > 0) {
    const pid = queue.shift();

    for (const childPid of childrenByParent.get(pid) ?? []) {
      if (!pids.has(childPid)) {
        pids.add(childPid);
        queue.push(childPid);
      }
    }
  }

  return pids;
}

function rssForProcessTree(rootPid) {
  const rows = processTable();
  const pids = descendantPids(rootPid, rows);

  return rows
    .filter(row => pids.has(row.pid))
    .reduce((total, row) => total + row.rss, 0);
}

function htmlPages() {
  if (!fs.existsSync(outputDir)) {
    return [];
  }

  return fs
    .readdirSync(outputDir)
    .filter(file => file.endsWith(".html"))
    .sort();
}

function directorySize(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  return fs.readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return total + directorySize(entryPath);
    }

    return total + fs.statSync(entryPath).size;
  }, 0);
}

function formatMiB(kib) {
  return `${(kib / 1024).toFixed(1)} MiB`;
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

const startedAt = performance.now();
let peakRssKiB = 0;

const child = spawn("npm", ["run", "build:astro:poc"], {
  cwd: rootDir,
  stdio: "inherit",
});

const poll = setInterval(() => {
  peakRssKiB = Math.max(peakRssKiB, rssForProcessTree(child.pid));
}, pollIntervalMs);

child.on("exit", (code, signal) => {
  clearInterval(poll);

  const durationSeconds = ((performance.now() - startedAt) / 1000).toFixed(2);
  const pages = htmlPages();

  process.stdout.write("\nAstro generation measurement\n");
  process.stdout.write(`  status: ${signal ? `signal ${signal}` : `exit ${code}`}\n`);
  process.stdout.write(`  duration: ${durationSeconds}s\n`);
  process.stdout.write(`  peak RSS: ${formatMiB(peakRssKiB)}\n`);
  process.stdout.write(`  html pages: ${pages.length}\n`);
  process.stdout.write(`  output size: ${formatSize(directorySize(outputDir))}\n`);

  if (pages.length > 0) {
    process.stdout.write(`  first page: ${pages[0]}\n`);
    process.stdout.write(`  last page: ${pages[pages.length - 1]}\n`);
  }

  process.exit(code ?? 1);
});
