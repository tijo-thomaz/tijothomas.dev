#!/usr/bin/env node
// Lighthouse gate (mobile, median of N runs). Report-only in gates.yml until U-09 enforces it.
// Usage: node scripts/lighthouse.mjs [--url <url>] [--runs 3] [--out <dir>] [--name lighthouse] [--root <dir>]
//   no --url: starts `next start` on a free port from the existing build (CG1 must have run).
// Writes <out>/<name>.json (per-run numbers, medians, thresholds, pass) and the median run's
// <name>.report.json / <name>.report.html. Thresholds: Performance, Accessibility, Best Practices
// and SEO each >= 95; CLS <= 0.05, LCP <= 2500 ms, TBT <= 150 ms. Exit 0 only if all hold.
// Lighthouse runs through `npx lighthouse@<pinned>` (not a devDependency: it is large and only the
// gate needs it). Exit 78 (BLOCKED) when no Chrome or no build is available.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { blocked, cliOptions, median, startNext, writeJson } from './lib/gate-utils.mjs';

const LIGHTHOUSE = 'lighthouse@13.6.0';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const MIN_SCORE = 95;
const MAX = { cls: 0.05, lcpMs: 2500, tbtMs: 150 };

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const runs = Number(opts.get('--runs', 3));
const outDir = path.resolve(root, opts.get('--out', 'lighthouse'));
const name = opts.get('--name', 'lighthouse');

function runOnce(url, i) {
  const base = path.join(outDir, `${name}-run${i}`);
  const args = ['--yes', LIGHTHOUSE, url, '--output=json', '--output=html', `--output-path="${base}"`,
    `--only-categories=${CATEGORIES.join(',')}`, '--quiet', '--chrome-flags="--headless=new --no-first-run"'];
  const r = spawnSync(`npx ${args.join(' ')}`, { cwd: root, shell: true, encoding: 'utf8', timeout: 300000 });
  const json = `${base}.report.json`;
  // Lighthouse on Windows can exit non-zero while cleaning its temp profile after a good run.
  if (!fs.existsSync(json)) {
    const out = `${r.stdout}${r.stderr}`;
    if (/No Chrome installations found|CHROME_PATH/i.test(out)) blocked('no Chrome/Chromium found for Lighthouse (set CHROME_PATH)');
    throw new Error(`lighthouse run ${i} wrote no report (exit ${r.status}):\n${out.slice(-2000)}`);
  }
  const lhr = JSON.parse(fs.readFileSync(json, 'utf8'));
  return {
    run: i, base,
    scores: Object.fromEntries(CATEGORIES.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)])),
    cls: lhr.audits['cumulative-layout-shift']?.numericValue,
    lcpMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? NaN),
    tbtMs: Math.round(lhr.audits['total-blocking-time']?.numericValue ?? NaN),
    formFactor: lhr.configSettings?.formFactor, lighthouseVersion: lhr.lighthouseVersion, fetchTime: lhr.fetchTime,
    runtimeError: lhr.runtimeError?.message,
  };
}

function summarise(results) {
  const med = {
    scores: Object.fromEntries(CATEGORIES.map((c) => [c, median(results.map((r) => r.scores[c]))])),
    cls: median(results.map((r) => r.cls)), lcpMs: median(results.map((r) => r.lcpMs)), tbtMs: median(results.map((r) => r.tbtMs)),
  };
  const checks = [
    ...CATEGORIES.map((c) => [`${c} ${med.scores[c]} >= ${MIN_SCORE}`, med.scores[c] >= MIN_SCORE]),
    [`CLS ${med.cls} <= ${MAX.cls}`, med.cls <= MAX.cls],
    [`LCP ${med.lcpMs} ms <= ${MAX.lcpMs} ms`, med.lcpMs <= MAX.lcpMs],
    [`TBT ${med.tbtMs} ms <= ${MAX.tbtMs} ms`, med.tbtMs <= MAX.tbtMs],
  ];
  return { med, checks };
}

// Keeps the run with the median Performance score as <name>.report.{json,html}; drops the others.
function keepMedianRun(results) {
  const sorted = [...results].sort((a, b) => a.scores.performance - b.scores.performance);
  const pick = sorted[Math.floor((sorted.length - 1) / 2)];
  for (const r of results) {
    for (const ext of ['json', 'html']) {
      const f = `${r.base}.report.${ext}`;
      if (r === pick) fs.renameSync(f, path.join(outDir, `${name}.report.${ext}`));
      else fs.rmSync(f, { force: true });
    }
  }
  return pick.run;
}

const server = opts.get('--url') ? null : await startNext(root);
const url = opts.get('--url') ?? server.url;
fs.mkdirSync(outDir, { recursive: true });
try {
  const results = [];
  for (let i = 1; i <= runs; i += 1) results.push(runOnce(url, i));
  const { med, checks } = summarise(results);
  const medianRun = keepMedianRun(results);
  const pass = checks.every(([, ok]) => ok);
  writeJson(path.join(outDir, `${name}.json`), {
    url: opts.get('--url') ?? '/ (next start, local production build)', tool: LIGHTHOUSE, formFactor: results[0].formFactor,
    runs: results.map(({ base: _b, ...r }) => r), medianRun, median: med, thresholds: { minScore: MIN_SCORE, ...MAX }, pass,
  });
  for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} lighthouse mobile median of ${runs}: ${label}`);
  console.log(`evidence: ${path.relative(root, path.join(outDir, `${name}.json`)).split(path.sep).join('/')}`);
  process.exitCode = pass ? 0 : 1;
} finally {
  server?.stop();
}
