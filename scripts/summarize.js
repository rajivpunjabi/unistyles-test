/**
 * Summarize + compare two Flashlight result JSON files into a markdown report.
 *
 * Flashlight writes one JSON per APK (flashlight test --resultsFilePath). Each
 * file is { name, status, iterations: [ { time, measures: { <i>: sample } } ] }
 * where each sample is { fps, ram (MB), cpu: { perName: {thread: %}, perCore } }.
 *
 * We aggregate per-iteration first (mean of a metric within an iteration), then
 * average those across iterations — this matches how Flashlight's own report
 * summarizes, so the numbers line up with the web report rather than pooling all
 * samples flat. The first JSON is the baseline; every other JSON is a candidate,
 * and deltas are candidate-vs-baseline.
 *
 * Usage: node scripts/summarize.js [out.md] <result1.json> <result2.json> [...]
 */
const fs = require('fs');
const path = require('path');

const JS_THREAD = 'mqt_v_js';
const UI_THREAD = 'UI Thread';
const RENDER_THREAD = 'RenderThread';
const JANK_FPS = 50;

function readResult(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  // Flashlight hardcodes name: "Results", so label by the result file's basename
  // (which mirrors the APK it ran, e.g. main / v3-unistyles) instead.
  const label = path.basename(file, '.json');
  return { label, iterations: data.iterations || [] };
}

function mean(values) {
  if (values.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i];
  }
  return sum / values.length;
}

function sampleCpuTotal(sample) {
  const perName = sample.cpu && sample.cpu.perName ? sample.cpu.perName : {};
  let total = 0;
  const names = Object.keys(perName);
  for (let i = 0; i < names.length; i += 1) {
    total += perName[names[i]];
  }
  return total;
}

function threadCpu(sample, thread) {
  const perName = sample.cpu && sample.cpu.perName ? sample.cpu.perName : {};
  return typeof perName[thread] === 'number' ? perName[thread] : 0;
}

/**
 * Reduce a result into a flat set of aggregate metrics. Per-iteration means are
 * collected then averaged (mean of means); min/max are taken over raw samples so
 * spikes and worst-frame numbers survive the averaging.
 */
function aggregate(result) {
  const iterFps = [];
  const iterCpuTotal = [];
  const iterCpuUi = [];
  const iterCpuJs = [];
  const iterCpuRender = [];
  const iterRam = [];
  const iterDurations = [];

  let sampleCount = 0;
  let fpsMin = Infinity;
  let ramMax = 0;
  let cpuMax = 0;
  let jankSamples = 0;

  for (let i = 0; i < result.iterations.length; i += 1) {
    const iteration = result.iterations[i];
    if (typeof iteration.time === 'number') {
      iterDurations.push(iteration.time);
    }
    const measures = iteration.measures || {};
    const keys = Object.keys(measures);

    const fps = [];
    const cpuTotal = [];
    const cpuUi = [];
    const cpuJs = [];
    const cpuRender = [];
    const ram = [];

    for (let k = 0; k < keys.length; k += 1) {
      const sample = measures[keys[k]];
      sampleCount += 1;

      if (typeof sample.fps === 'number') {
        fps.push(sample.fps);
        if (sample.fps < fpsMin) {
          fpsMin = sample.fps;
        }
        if (sample.fps < JANK_FPS) {
          jankSamples += 1;
        }
      }
      if (typeof sample.ram === 'number') {
        ram.push(sample.ram);
        if (sample.ram > ramMax) {
          ramMax = sample.ram;
        }
      }
      const total = sampleCpuTotal(sample);
      cpuTotal.push(total);
      if (total > cpuMax) {
        cpuMax = total;
      }
      cpuUi.push(threadCpu(sample, UI_THREAD));
      cpuJs.push(threadCpu(sample, JS_THREAD));
      cpuRender.push(threadCpu(sample, RENDER_THREAD));
    }

    iterFps.push(mean(fps));
    iterCpuTotal.push(mean(cpuTotal));
    iterCpuUi.push(mean(cpuUi));
    iterCpuJs.push(mean(cpuJs));
    iterCpuRender.push(mean(cpuRender));
    iterRam.push(mean(ram));
  }

  return {
    label: result.label,
    iterationCount: result.iterations.length,
    sampleCount,
    avgTestTimeMs: mean(iterDurations),
    fps: mean(iterFps),
    fpsMin: fpsMin === Infinity ? 0 : fpsMin,
    jankPct: sampleCount ? (jankSamples / sampleCount) * 100 : 0,
    cpuTotal: mean(iterCpuTotal),
    cpuMax,
    cpuUi: mean(iterCpuUi),
    cpuJs: mean(iterCpuJs),
    cpuRender: mean(iterCpuRender),
    ram: mean(iterRam),
    ramMax,
  };
}

function fmt(n, digits) {
  const d = typeof digits === 'number' ? digits : 1;
  return Number(n).toFixed(d);
}

function deltaPct(baseline, candidate) {
  if (baseline === 0) {
    return candidate === 0 ? '0.0%' : 'n/a';
  }
  const pct = ((candidate - baseline) / baseline) * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

// Metric table spec: label + how to pull it from an aggregate + unit/precision.
const METRICS = [
  { label: 'Avg FPS', get: (r) => r.fps, unit: '', digits: 1 },
  { label: 'Min FPS (worst sample)', get: (r) => r.fpsMin, unit: '', digits: 1 },
  { label: `Jank (% samples < ${JANK_FPS} fps)`, get: (r) => r.jankPct, unit: '%', digits: 1 },
  { label: 'Total CPU', get: (r) => r.cpuTotal, unit: '%', digits: 1 },
  { label: 'CPU peak', get: (r) => r.cpuMax, unit: '%', digits: 1 },
  { label: 'UI-thread CPU', get: (r) => r.cpuUi, unit: '%', digits: 1 },
  { label: 'JS-thread CPU (mqt_v_js)', get: (r) => r.cpuJs, unit: '%', digits: 1 },
  { label: 'RenderThread CPU', get: (r) => r.cpuRender, unit: '%', digits: 1 },
  { label: 'Avg RAM', get: (r) => r.ram, unit: 'MB', digits: 1 },
  { label: 'RAM peak', get: (r) => r.ramMax, unit: 'MB', digits: 1 },
  { label: 'Avg flow time', get: (r) => r.avgTestTimeMs / 1000, unit: 's', digits: 2 },
];

// A single table cell: value + unit, and (Δ% vs baseline) for candidates.
function cell(value, unit, digits, baseValue, isBaseline) {
  const u = unit ? ` ${unit}` : '';
  const v = `${fmt(value, digits)}${u}`;
  if (isBaseline) {
    return v;
  }
  return `${v} (${deltaPct(baseValue, value)})`;
}

// results[0] is the baseline; every other result is a candidate compared to it.
function buildMarkdown(results) {
  const base = results[0];
  const labels = results.map((r) => r.label);
  const lines = [];

  lines.push(`# Flashlight comparison: ${labels.join(' vs ')}`);
  lines.push('');
  lines.push(
    `Baseline **${base.label}**. ${base.iterationCount} iterations each. ` +
      'Candidate cells show the value and (Δ% vs baseline). Metrics are per-iteration means ' +
      'averaged across iterations; min/max are over raw samples.',
  );
  lines.push('');
  lines.push('## Metrics');
  lines.push('');
  lines.push(
    '| Metric | ' + labels.map((l, i) => (i === 0 ? `${l} (baseline)` : l)).join(' | ') + ' |',
  );
  lines.push('|---' + '|---'.repeat(labels.length) + '|');
  for (let m = 0; m < METRICS.length; m += 1) {
    const spec = METRICS[m];
    const baseVal = spec.get(base);
    const cells = [];
    for (let i = 0; i < results.length; i += 1) {
      cells.push(cell(spec.get(results[i]), spec.unit, spec.digits, baseVal, i === 0));
    }
    lines.push(`| ${spec.label} | ${cells.join(' | ')} |`);
  }
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  for (const finding of findings(results)) {
    lines.push(`- ${finding}`);
  }
  lines.push('');
  return lines.join('\n');
}

function findings(results) {
  const base = results[0];
  const out = [];
  for (let i = 1; i < results.length; i += 1) {
    const c = results[i];
    out.push(
      `**${c.label}** vs ${base.label}: ` +
        `JS-thread CPU ${fmt(base.cpuJs)}% -> ${fmt(c.cpuJs)}% (${deltaPct(base.cpuJs, c.cpuJs)}); ` +
        `total CPU ${fmt(base.cpuTotal)}% -> ${fmt(c.cpuTotal)}% (${deltaPct(base.cpuTotal, c.cpuTotal)}); ` +
        `avg FPS ${fmt(base.fps)} -> ${fmt(c.fps)} (${deltaPct(base.fps, c.fps)}); ` +
        `avg RAM ${fmt(base.ram)} -> ${fmt(c.ram)} MB (${deltaPct(base.ram, c.ram)}).`,
    );
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const jsonFiles = args.filter((a) => a.endsWith('.json'));
  const mdArg = args.find((a) => a.endsWith('.md'));
  if (jsonFiles.length < 2) {
    console.error(
      'usage: node scripts/summarize.js [out.md] <result1.json> <result2.json> [result3.json ...]',
    );
    process.exit(1);
  }

  const results = [];
  for (let i = 0; i < jsonFiles.length; i += 1) {
    results.push(aggregate(readResult(jsonFiles[i])));
  }
  const markdown = buildMarkdown(results);

  const outFile = mdArg || path.join(path.dirname(jsonFiles[0]), 'summary.md');
  fs.writeFileSync(outFile, markdown);
  console.log(markdown);
  console.log(`\nWrote ${outFile}`);
}

main();
