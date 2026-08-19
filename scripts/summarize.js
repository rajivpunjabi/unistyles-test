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
 * samples flat. The first file is the baseline; the second is the candidate, and
 * deltas are candidate-vs-baseline.
 *
 * Usage: node scripts/summarize.js <baseline.json> <candidate.json> [out.md]
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

function row(metric, baseVal, candVal, unit, delta) {
  const u = unit ? ` ${unit}` : '';
  return `| ${metric} | ${baseVal}${u} | ${candVal}${u} | ${delta} |`;
}

function buildMarkdown(base, cand) {
  const lines = [];
  lines.push(`# Flashlight comparison: ${base.label} vs ${cand.label}`);
  lines.push('');
  lines.push(
    `Baseline **${base.label}**, candidate **${cand.label}**. ` +
      `${base.iterationCount} iterations each ` +
      `(${base.sampleCount} / ${cand.sampleCount} samples). ` +
      'Deltas are candidate vs baseline. Metrics are per-iteration means averaged across iterations; ' +
      'min/max are over raw samples.'
  );
  lines.push('');
  lines.push('## Metrics');
  lines.push('');
  lines.push('| Metric | ' + base.label + ' | ' + cand.label + ' | Δ |');
  lines.push('|---|---|---|---|');
  lines.push(row('Avg FPS', fmt(base.fps), fmt(cand.fps), '', deltaPct(base.fps, cand.fps)));
  lines.push(row('Min FPS (worst sample)', fmt(base.fpsMin), fmt(cand.fpsMin), '', deltaPct(base.fpsMin, cand.fpsMin)));
  lines.push(row(`Jank (% samples < ${JANK_FPS} fps)`, fmt(base.jankPct), fmt(cand.jankPct), '%', deltaPct(base.jankPct, cand.jankPct)));
  lines.push(row('Total CPU', fmt(base.cpuTotal), fmt(cand.cpuTotal), '%', deltaPct(base.cpuTotal, cand.cpuTotal)));
  lines.push(row('CPU peak', fmt(base.cpuMax), fmt(cand.cpuMax), '%', deltaPct(base.cpuMax, cand.cpuMax)));
  lines.push(row('UI-thread CPU', fmt(base.cpuUi), fmt(cand.cpuUi), '%', deltaPct(base.cpuUi, cand.cpuUi)));
  lines.push(row('JS-thread CPU (mqt_v_js)', fmt(base.cpuJs), fmt(cand.cpuJs), '%', deltaPct(base.cpuJs, cand.cpuJs)));
  lines.push(row('RenderThread CPU', fmt(base.cpuRender), fmt(cand.cpuRender), '%', deltaPct(base.cpuRender, cand.cpuRender)));
  lines.push(row('Avg RAM', fmt(base.ram), fmt(cand.ram), 'MB', deltaPct(base.ram, cand.ram)));
  lines.push(row('RAM peak', fmt(base.ramMax), fmt(cand.ramMax), 'MB', deltaPct(base.ramMax, cand.ramMax)));
  lines.push(row('Avg flow time', fmt(base.avgTestTimeMs / 1000, 2), fmt(cand.avgTestTimeMs / 1000, 2), 's', deltaPct(base.avgTestTimeMs, cand.avgTestTimeMs)));
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  for (const finding of findings(base, cand)) {
    lines.push(`- ${finding}`);
  }
  lines.push('');
  return lines.join('\n');
}

function findings(base, cand) {
  const out = [];
  out.push(
    `JS-thread CPU: ${fmt(base.cpuJs)}% -> ${fmt(cand.cpuJs)}% (${deltaPct(base.cpuJs, cand.cpuJs)}). ` +
      'This is the primary v2-vs-v3 signal: style updates that no longer re-render in JS.'
  );
  out.push(`Total CPU: ${fmt(base.cpuTotal)}% -> ${fmt(cand.cpuTotal)}% (${deltaPct(base.cpuTotal, cand.cpuTotal)}).`);
  out.push(
    `UI-thread CPU: ${fmt(base.cpuUi)}% -> ${fmt(cand.cpuUi)}% (${deltaPct(base.cpuUi, cand.cpuUi)}) ` +
      '(the on-screen change still applies on both, so this stays close).'
  );
  out.push(`Avg FPS: ${fmt(base.fps)} -> ${fmt(cand.fps)} (${deltaPct(base.fps, cand.fps)}); worst sample ${fmt(base.fpsMin)} -> ${fmt(cand.fpsMin)}.`);
  out.push(`Avg RAM: ${fmt(base.ram)} MB -> ${fmt(cand.ram)} MB (${deltaPct(base.ram, cand.ram)}).`);
  return out;
}

function main() {
  const [baseFile, candFile, outArg] = process.argv.slice(2);
  if (!baseFile || !candFile) {
    console.error('usage: node scripts/summarize.js <baseline.json> <candidate.json> [out.md]');
    process.exit(1);
  }
  const base = aggregate(readResult(baseFile));
  const cand = aggregate(readResult(candFile));
  const markdown = buildMarkdown(base, cand);

  const outFile = outArg || path.join(path.dirname(baseFile), 'summary.md');
  fs.writeFileSync(outFile, markdown);
  console.log(markdown);
  console.log(`\nWrote ${outFile}`);
}

main();
