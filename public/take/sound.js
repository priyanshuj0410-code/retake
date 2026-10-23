window.SND_LS = (() => {

const S = { ctx: null, bus: null, comp: null, master: null, fx: null, noise: null, vol: 0.4, calm: false, loop: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(c) {
  const len = Math.floor(c.sampleRate * 2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  const r = mulberry(12345);
  for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
  return buf;
}

function buildChain(c, vol) {
  const bus = c.createGain();
  bus.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 12;
  comp.ratio.value = 8;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  const master = c.createGain();
  master.gain.value = vol;
  bus.connect(comp);
  comp.connect(master);
  master.connect(c.destination);
  return { bus: bus, comp: comp, master: master };
}

function ensureCtx() {
  if (S.ctx) {
    if (S.ctx.state === 'suspended') S.ctx.resume();
    return S.ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const c = new AC();
  S.ctx = c;
  S.noise = makeNoise(c);
  const ch = buildChain(c, S.vol);
  S.bus = ch.bus; S.comp = ch.comp; S.master = ch.master;
  S.fx = c.createGain();
  S.fx.connect(S.bus);
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b; s.connect(c.destination); s.start(0);
  if (c.state === 'suspended') c.resume();
  return c;
}

/* ---------- voices ---------- */
function env(out, t, a, peak, hold, d) {
  const c = S.ctx, g = c.createGain(), p = Math.max(peak, 0.0002), at = Math.max(a, 0.001);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(p, t + at);
  if (hold > 0) g.gain.setValueAtTime(p, t + at + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + at + hold + d);
  g.connect(out);
  return g;
}

function tone(out, t, o) {
  const c = S.ctx;
  const f = o.f, f2 = o.f2 || o.f, glide = o.glide || 0.05;
  const a = o.a === undefined ? 0.004 : o.a, hold = o.hold || 0, d = o.d || 0.1;
  const osc = c.createOscillator();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(f, t);
  if (f2 !== f) osc.frequency.exponentialRampToValueAtTime(f2, t + glide);
  let src = osc;
  if (o.lp) {
    const fl = c.createBiquadFilter();
    fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.Q.value = o.q || 0.7;
    osc.connect(fl); src = fl;
  }
  src.connect(env(out, t, a, o.peak === undefined ? 0.3 : o.peak, hold, d));
  osc.start(t);
  osc.stop(t + Math.max(a, 0.001) + hold + d + 0.04);
}

function burst(out, t, o) {
  const c = S.ctx;
  const a = o.a === undefined ? 0.002 : o.a, hold = o.hold || 0, d = o.d || 0.03;
  const src = c.createBufferSource();
  src.buffer = S.noise; src.loop = true;
  const fl = c.createBiquadFilter();
  fl.type = o.type || 'bandpass';
  fl.frequency.setValueAtTime(o.f || 2000, t);
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + (o.sweep || (a + hold + d)));
  fl.Q.value = o.q || 0.8;
  src.connect(fl);
  fl.connect(env(out, t, a, o.peak === undefined ? 0.2 : o.peak, hold, d));
  src.start(t, (o.off || 0) % 1.8);
  src.stop(t + Math.max(a, 0.001) + hold + d + 0.04);
}

function thump(out, t, o) {
  tone(out, t, { f: o.f, f2: o.f2, glide: o.glide, d: o.d, peak: o.peak * 0.4 });
  tone(out, t, { f: o.f, f2: o.f2, glide: o.glide, type: 'sawtooth', lp: 1600, d: o.d * 0.8, peak: o.peak * 0.36 });
}

function bell(out, t, f, o) {
  const r = o.ratios || [1, 2.76, 5.4], g = o.gains || [1, 0.35, 0.12];
  r.forEach((x, i) => tone(out, t, { f: f * x, a: 0.002, d: o.d / (1 + i * 0.9), peak: o.peak * g[i] }));
}

function makeDelay(out, time, fb, mix, tone) {
  const c = S.ctx;
  const input = c.createGain();
  const dly = c.createDelay(1.0);
  dly.delayTime.value = time;
  const fbg = c.createGain(); fbg.gain.value = fb;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = tone;
  const wet = c.createGain(); wet.gain.value = mix;
  input.connect(out);
  input.connect(dly);
  dly.connect(lp);
  lp.connect(fbg); fbg.connect(dly);
  lp.connect(wet); wet.connect(out);
  return input;
}

function twang(out, t, m, dur, peak, vib) {
  const c = S.ctx, f = mtof(m), end = t + dur + 0.05;
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(f * 1.014, t);
  o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass'; fl.Q.value = 4;
  fl.frequency.setValueAtTime(Math.min(f * 10, 5200), t);
  fl.frequency.exponentialRampToValueAtTime(Math.max(f * 2.5, 600), t + Math.min(dur, 0.3));
  const g = env(out, t, 0.003, peak, 0, dur);
  o.connect(fl); fl.connect(g);
  if (vib) {
    const l = c.createOscillator(), lg = c.createGain();
    l.frequency.value = 5.8;
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(14, t + dur * 0.6);
    l.connect(lg); lg.connect(o.detune);
    l.start(t); l.stop(end);
  }
  o.start(t); o.stop(end);
}

function reed(out, t, f, dur, peak, o) {
  const c = S.ctx, op = o || {};
  const a = op.a || 0.05, rel = op.rel || 0.14, end = t + dur + 0.05;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = op.lp || 2000; lp.Q.value = 0.8;
  const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = op.pk || 1100; pk.gain.value = 8; pk.Q.value = 1.4;
  const g = env(out, t, a, peak, Math.max(0, dur - a - rel), rel);
  lp.connect(pk); pk.connect(g);
  [-6, 6].forEach(dt => {
    const osc = c.createOscillator();
    osc.type = 'sawtooth'; osc.detune.value = dt;
    osc.frequency.setValueAtTime(op.from || f, t);
    if (op.from) osc.frequency.exponentialRampToValueAtTime(f, t + 0.07);
    if (op.vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = 5.5;
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(op.vib, t + 0.3);
      l.connect(lg); lg.connect(osc.detune);
      l.start(t); l.stop(end);
    }
    osc.connect(lp);
    osc.start(t); osc.stop(end);
  });
}

function reedBed(out, h, f, p) {
  const c = S.ctx, t = h.t0;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 0.8;
  const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 850; pk.gain.value = 6; pk.Q.value = 1.2;
  const g = c.createGain(); g.gain.value = p;
  const lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = 0.17; lg.gain.value = p * 0.15;
  lfo.connect(lg); lg.connect(g.gain);
  lp.connect(pk); pk.connect(g); g.connect(out);
  [-6, 6].forEach(dt => {
    const o = c.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt;
    o.connect(lp); o.start(t); h.keep(o);
  });
  lfo.start(t); h.keep(lfo);
}

function drone(out, h, f, p, type, lpf) {
  const c = S.ctx, o = c.createOscillator();
  o.type = type; o.frequency.value = f;
  const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lpf;
  const g = c.createGain(); g.gain.value = p;
  o.connect(fl); fl.connect(g); g.connect(out);
  o.start(h.t0); h.keep(o);
}

function noiseBed(out, h, type, f, q, p, off) {
  const c = S.ctx, src = c.createBufferSource();
  src.buffer = S.noise; src.loop = true;
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = c.createGain(); g.gain.value = p;
  src.connect(fl); fl.connect(g); g.connect(out);
  src.start(h.t0, off || 0); h.keep(src);
  return g;
}

function murmur(out, h, f, q, base, rate, depth, off) {
  const c = S.ctx;
  const g = noiseBed(out, h, 'bandpass', f, q, base, off);
  const lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = rate; lg.gain.value = depth;
  lfo.connect(lg); lg.connect(g.gain);
  lfo.start(h.t0); h.keep(lfo);
}

/* ---------- sound effects: functions of time only ---------- */
const FX = {
  lugdi: {
    tap(t, o) {
      tone(o, t, { f: 430, f2: 300, glide: 0.045, type: 'triangle', d: 0.07, peak: 0.4 });
      burst(o, t, { f: 1800, q: 1.2, a: 0.001, d: 0.012, peak: 0.14, off: 0.2 });
    },
    unpick(t, o) {
      tone(o, t, { f: 320, f2: 215, glide: 0.05, type: 'triangle', d: 0.06, peak: 0.28 });
      burst(o, t, { f: 1300, q: 1, a: 0.001, d: 0.01, peak: 0.08, off: 0.2 });
    },
    commit(t, o) {
      burst(o, t, { f: 2200, q: 1.5, a: 0.001, d: 0.012, peak: 0.3, off: 0.5 });
      thump(o, t + 0.04, { f: 250, f2: 115, glide: 0.12, d: 0.2, peak: 0.8 });
      tone(o, t + 0.04, { f: 320, f2: 180, glide: 0.1, type: 'triangle', d: 0.12, peak: 0.3 });
      burst(o, t + 0.17, { f: 900, f2: 2600, sweep: 0.14, q: 0.8, a: 0.02, d: 0.12, peak: 0.16, off: 0.9 });
    },
    refuse(t, o) {
      [0, 0.11].forEach(dt => {
        tone(o, t + dt, { f: 240, f2: 200, glide: 0.04, type: 'triangle', d: 0.07, peak: 0.34, lp: 900 });
        burst(o, t + dt, { type: 'lowpass', f: 700, a: 0.002, d: 0.02, peak: 0.12, off: 0.15 });
      });
    },
    fill(t, o) {
      burst(o, t, { type: 'highpass', f: 3500, a: 0.001, d: 0.01, peak: 0.14, off: 0.3 });
      tone(o, t + 0.012, { f: 520, f2: 400, glide: 0.04, type: 'triangle', d: 0.07, peak: 0.36 });
      tone(o, t + 0.012, { f: 1040, f2: 800, glide: 0.04, d: 0.04, peak: 0.07 });
    },
    spend(t, o) {
      thump(o, t, { f: 300, f2: 130, glide: 0.07, d: 0.16, peak: 0.75 });
      tone(o, t, { f: 420, f2: 210, glide: 0.05, type: 'triangle', d: 0.08, peak: 0.24 });
      burst(o, t, { f: 1100, q: 0.7, a: 0.001, d: 0.05, peak: 0.32, off: 1.1 });
      burst(o, t + 0.05, { type: 'lowpass', f: 2400, a: 0.01, d: 0.07, peak: 0.06, off: 1.4 });
    },
    result(t, o) {
      const calm = S.calm, n = calm ? 2 : 3, gap = calm ? 0.17 : 0.34;
      for (let i = 0; i < n; i++) {
        const s = t + i * gap, k = s + gap * 0.72;
        burst(o, s, { f: 500, f2: 1100, sweep: gap * 0.7, q: 0.9, a: gap * 0.5, d: gap * 0.2, peak: 0.16, off: 0.2 + i * 0.31 });
        thump(o, k, { f: 260, f2: 130, glide: 0.08, d: calm ? 0.1 : 0.14, peak: 0.6 });
        tone(o, k, { f: 260, f2: 140, glide: 0.07, type: 'triangle', d: 0.08, peak: 0.2 });
        burst(o, k, { f: 1600, q: 1.2, a: 0.001, d: 0.02, peak: 0.22, off: 0.6 + i * 0.27 });
      }
      if (!calm) burst(o, t + (n - 1) * gap + gap * 0.72 + 0.08, { type: 'highpass', f: 3000, a: 0.01, d: 0.12, peak: 0.05, off: 1.3 });
    },
    milestone(t, o) {
      thump(o, t, { f: 270, f2: 115, glide: 0.09, d: 0.22, peak: 0.85 });
      tone(o, t, { f: 340, f2: 150, glide: 0.06, type: 'triangle', d: 0.1, peak: 0.26 });
      burst(o, t, { f: 1000, q: 0.7, a: 0.001, d: 0.06, peak: 0.36, off: 1.1 });
      if (!S.calm) bell(o, t + 0.16, 1175, { peak: 0.22, d: 0.7 });
    },
    open(t, o) {
      burst(o, t, { f: 700, f2: 2400, sweep: 0.16, q: 1.1, a: 0.03, d: 0.12, peak: 0.2, off: 0.5 });
      tone(o, t + 0.15, { f: 360, f2: 300, glide: 0.04, type: 'triangle', d: 0.05, peak: 0.18 });
    },
    close(t, o) {
      burst(o, t, { f: 2400, f2: 700, sweep: 0.14, q: 1.1, a: 0.02, d: 0.1, peak: 0.18, off: 0.5 });
      tone(o, t + 0.12, { f: 280, f2: 230, glide: 0.04, type: 'triangle', d: 0.05, peak: 0.16 });
    },
    tab(t, o) {
      burst(o, t, { type: 'highpass', f: 2500, a: 0.002, d: 0.04, peak: 0.18, off: 0.7 });
      burst(o, t + 0.03, { f: 1200, q: 1, a: 0.002, d: 0.03, peak: 0.12, off: 0.9 });
    },
    toast(t, o) {
      tone(o, t, { f: 880, f2: 850, glide: 0.1, type: 'triangle', d: 0.14, peak: 0.24 });
      tone(o, t, { f: 1760, d: 0.05, peak: 0.05 });
      burst(o, t, { type: 'highpass', f: 3500, a: 0.001, d: 0.015, peak: 0.05, off: 0.3 });
    },
    cover(t, o) {
      burst(o, t, { f: 900, f2: 3000, sweep: 0.22, q: 0.8, a: 0.05, d: 0.12, peak: 0.18, off: 0.4 });
      twang(o, t + 0.2, 62, 0.32, 0.5, false);
    }
  },
  station: {
    tap(t, o) {
      tone(o, t, { f: 1250, a: 0.002, d: 0.09, peak: 0.22 });
      tone(o, t, { f: 3450, a: 0.001, d: 0.035, peak: 0.07 });
      burst(o, t, { type: 'highpass', f: 4000, a: 0.001, d: 0.008, peak: 0.06, off: 0.2 });
    },
    unpick(t, o) {
      tone(o, t, { f: 980, a: 0.002, d: 0.06, peak: 0.18 });
      tone(o, t, { f: 2700, a: 0.001, d: 0.025, peak: 0.05 });
    },
    commit(t, o) {
      burst(o, t, { type: 'highpass', f: 3500, a: 0.001, d: 0.01, peak: 0.26, off: 0.5 });
      tone(o, t + 0.01, { f: 310, f2: 200, glide: 0.04, type: 'triangle', d: 0.05, peak: 0.26 });
      thump(o, t + 0.09, { f: 240, f2: 110, glide: 0.1, d: 0.2, peak: 0.8 });
      tone(o, t + 0.09, { f: 300, f2: 150, glide: 0.08, type: 'triangle', d: 0.1, peak: 0.3 });
      burst(o, t + 0.095, { f: 1800, q: 1.2, a: 0.001, d: 0.02, peak: 0.3, off: 1.0 });
      burst(o, t + 0.2, { type: 'highpass', f: 4500, a: 0.001, d: 0.015, peak: 0.1, off: 1.6 });
    },
    refuse(t, o) {
      [0, 0.12].forEach(dt => {
        tone(o, t + dt, { f: 230, f2: 190, glide: 0.05, type: 'triangle', d: 0.09, peak: 0.38, lp: 1000 });
        burst(o, t + dt, { type: 'lowpass', f: 500, a: 0.002, d: 0.025, peak: 0.12, off: 0.4 });
      });
    },
    fill(t, o) {
      burst(o, t, { f: 2600, q: 0.9, a: 0.02, d: 0.04, peak: 0.14, off: 0.8 });
      burst(o, t + 0.06, { type: 'highpass', f: 4000, a: 0.001, d: 0.01, peak: 0.2, off: 1.1 });
      tone(o, t + 0.06, { f: 700, f2: 600, glide: 0.03, type: 'triangle', d: 0.05, peak: 0.24 });
    },
    spend(t, o) {
      burst(o, t, { type: 'highpass', f: 3800, a: 0.001, d: 0.012, peak: 0.38, off: 1.0 });
      burst(o, t + 0.012, { f: 1500, q: 1.5, a: 0.001, d: 0.03, peak: 0.22, off: 1.2 });
      tone(o, t + 0.01, { f: 2200, a: 0.001, d: 0.09, peak: 0.16 });
      tone(o, t + 0.01, { f: 5300, a: 0.001, d: 0.03, peak: 0.05 });
      tone(o, t + 0.02, { f: 260, f2: 160, glide: 0.05, type: 'triangle', d: 0.06, peak: 0.3 });
      burst(o, t + 0.075, { type: 'highpass', f: 5000, a: 0.001, d: 0.008, peak: 0.08, off: 1.5 });
    },
    result(t, o) {
      const calm = S.calm, R = mulberry(7), n = calm ? 5 : 18, span = calm ? 0.28 : 0.92;
      for (let i = 0; i < n; i++) {
        const u = n > 1 ? i / (n - 1) : 0;
        const at = Math.max(t, t + span * Math.pow(u, 1.6) + (R() - 0.5) * 0.008);
        burst(o, at, { f: 1500 + R() * 1100, q: 1.4, a: 0.001, d: 0.016, peak: 0.14 + R() * 0.1, off: R() * 1.7 });
        if (i % 3 === 0) tone(o, at, { f: 600 + R() * 300, f2: 450, glide: 0.02, type: 'triangle', a: 0.001, d: 0.025, peak: 0.08 });
      }
      const end = t + span + 0.07;
      tone(o, end, { f: 300, f2: 200, glide: 0.07, type: 'triangle', d: 0.12, peak: 0.4 });
      burst(o, end, { f: 1200, q: 1, a: 0.001, d: 0.025, peak: 0.32, off: 1.3 });
    },
    milestone(t, o) {
      burst(o, t, { type: 'highpass', f: 3000, a: 0.001, d: 0.012, peak: 0.3, off: 0.5 });
      thump(o, t + 0.03, { f: 260, f2: 110, glide: 0.1, d: 0.24, peak: 0.85 });
      tone(o, t + 0.03, { f: 340, f2: 160, glide: 0.08, type: 'triangle', d: 0.1, peak: 0.28 });
      burst(o, t + 0.035, { f: 1700, q: 1.1, a: 0.001, d: 0.03, peak: 0.3, off: 1.2 });
      if (!S.calm) bell(o, t + 0.15, 1046, { peak: 0.22, d: 0.7, ratios: [1, 2.32, 4.1], gains: [1, 0.3, 0.1] });
    },
    open(t, o) {
      burst(o, t, { type: 'highpass', f: 1500, f2: 4000, sweep: 0.15, q: 0.7, a: 0.03, d: 0.12, peak: 0.16, off: 0.6 });
      tone(o, t + 0.16, { f: 240, f2: 170, glide: 0.04, type: 'triangle', d: 0.06, peak: 0.32 });
    },
    close(t, o) {
      burst(o, t, { type: 'highpass', f: 4000, f2: 1500, sweep: 0.14, q: 0.7, a: 0.02, d: 0.1, peak: 0.15, off: 0.6 });
      tone(o, t + 0.13, { f: 290, f2: 220, glide: 0.04, type: 'triangle', d: 0.06, peak: 0.3 });
    },
    tab(t, o) {
      burst(o, t, { f: 1900, q: 1.4, a: 0.001, d: 0.02, peak: 0.32, off: 0.4 });
      tone(o, t, { f: 760, f2: 520, glide: 0.02, type: 'triangle', a: 0.001, d: 0.03, peak: 0.16 });
      burst(o, t + 0.028, { f: 1100, q: 1, a: 0.001, d: 0.015, peak: 0.16, off: 0.9 });
    },
    toast(t, o) {
      bell(o, t, 1397, { peak: 0.2, d: 0.18, ratios: [1, 2.4], gains: [1, 0.3] });
    },
    cover(t, o) {
      const R = mulberry(3);
      for (let i = 0; i < 5; i++) burst(o, t + i * 0.05, { f: 1400 + R() * 1000, q: 1.4, a: 0.001, d: 0.016, peak: 0.18, off: R() * 1.7 });
      tone(o, t + 0.26, { f: 196, a: 0.06, d: 0.16, peak: 0.2 });
      tone(o, t + 0.26, { f: 392, a: 0.05, d: 0.14, peak: 0.26 });
      tone(o, t + 0.26, { f: 588, a: 0.05, d: 0.12, peak: 0.12 });
      burst(o, t + 0.26, { f: 1100, q: 1, a: 0.001, d: 0.025, peak: 0.22, off: 0.5 });
    }
  }
};

/* ---------- music loops ---------- */
function keyed(bars, per) {
  const m = {};
  bars.forEach((arr, b) => arr.forEach(n => {
    const k = b * per + n[0];
    if (!m[k]) m[k] = [];
    m[k].push(n);
  }));
  return m;
}

function bongo(out, t, hi, p) {
  if (hi) tone(out, t, { f: 480, f2: 360, glide: 0.05, a: 0.002, d: 0.09, peak: p });
  else tone(out, t, { f: 310, f2: 215, glide: 0.07, a: 0.002, d: 0.13, peak: p });
  burst(out, t, { f: hi ? 2600 : 1800, q: 1.5, a: 0.001, d: 0.012, peak: p * 0.5, off: hi ? 0.2 : 0.6 });
}
function bassNote(out, t, m, dur, p) {
  const f = mtof(m), hold = Math.max(0, dur - 0.1);
  tone(out, t, { f: f, type: 'triangle', a: 0.006, hold: hold, d: 0.1, peak: p, lp: 900 });
  tone(out, t, { f: f, type: 'sawtooth', a: 0.006, hold: hold, d: 0.08, peak: p * 0.35, lp: 700 });
}
function organ(out, t, notes, dur, p) {
  notes.forEach(m => {
    const f = mtof(m), q = p / notes.length;
    tone(out, t, { f: f, type: 'square', a: 0.005, hold: dur * 0.4, d: dur * 0.6, peak: q * 0.5, lp: 2200 });
    tone(out, t, { f: f * 2, a: 0.005, hold: dur * 0.4, d: dur * 0.6, peak: q * 0.6 });
  });
}

const LA = (function () {
  const bpm = 140, step = 60 / bpm / 4;
  const BASS = [[50,53,57,53],[50,57,60,57],[55,58,62,58],[50,53,57,61],[58,62,65,62],[57,61,64,61],[62,57,53,57],[57,55,53,52]];
  const CH = [[62,65,69],[62,65,69],[55,58,62],[62,65,69],[58,62,65],[57,61,64,67],[62,65,69],[57,61,64,67]];
  const PAT = 'L.HHL.H.L.HHLH.H', FILL = 'L.HHL.H.LLHHLLHH';
  const MEL = keyed([
    [[0,69,2],[3,74,1],[4,77,2],[6,76,1],[7,74,1],[8,72,4],[14,69,1]],
    [[0,70,2],[2,69,2],[4,67,2],[6,65,2],[8,64,4]],
    [[0,70,2],[3,74,1],[4,79,2],[6,77,1],[7,75,1],[8,74,4],[14,70,1]],
    [[0,74,2],[2,72,2],[4,69,4],[8,62,2]],
    [[0,77,3],[3,74,1],[4,70,4],[8,74,2],[10,77,2],[12,79,4]],
    [[0,76,2],[2,73,2],[4,69,4],[8,67,2],[10,69,2],[12,73,4]],
    [[0,74,3],[3,77,1],[4,81,4],[8,77,2],[10,74,2],[12,69,4]],
    [[0,73,2],[2,76,2],[4,79,2],[6,76,2],[8,73,4]]
  ], 16);
  return {
    id: 'lA', trim: 0.22, stepDur: step, steps: 128,
    setup(out, h) {
      h.dly = makeDelay(out, 60 / bpm * 0.75, S.calm ? 0 : 0.32, S.calm ? 0 : 0.28, 2600);
    },
    onStep(i, t, h) {
      const bar = i >> 4, s = i & 15, out = h.out, fill = (bar === 3 || bar === 7) && !S.calm;
      if (s % 4 === 0) bassNote(out, t, BASS[bar][s >> 2], step * 3.6, 0.4);
      const ch = (fill ? FILL : PAT).charAt(s);
      if (ch !== '.') bongo(out, t, ch === 'H', s % 4 === 0 ? 0.42 : 0.3);
      if (s % 4 === 2) burst(out, t, { type: 'highpass', f: 7000, a: 0.001, d: 0.03, peak: 0.07, off: (i * 0.173) % 1.7 });
      const stabs = fill ? [6, 10, 14] : [6, 14];
      if (stabs.indexOf(s) >= 0) organ(out, t, CH[bar], step * 1.6, 0.3);
      const ms = MEL[i];
      if (ms) ms.forEach(n => twang(h.dly, t, n[1], n[2] * step * 1.15, 0.22, n[2] >= 4 && !S.calm));
    }
  };
})();

const LB = (function () {
  const bpm = 90, step = 60 / bpm / 2;
  const THEKA = ['dha','dhin','dhin','dha','dha','dhin','dhin','dha','dha','tin','tin','ta','ta','dhin','dhin','dha'];
  const ORN = { 7: 'na', 15: 'na', 23: 'ge', 31: 'ge' };
  const PHR = keyed([[[16,67,3],[19,65,1],[20,63,2],[22,62,4],[26,70,2],[28,69,2],[30,67,2]]], 32);
  function bayan(out, t, p) {
    tone(out, t, { f: 100, f2: 150, glide: 0.14, a: 0.003, d: 0.32, peak: p });
    tone(out, t, { f: 200, f2: 290, glide: 0.12, type: 'triangle', a: 0.003, d: 0.12, peak: p * 0.3 });
    burst(out, t, { type: 'lowpass', f: 500, a: 0.002, d: 0.03, peak: p * 0.25, off: 0.2 });
  }
  function dayan(out, t, kind, p) {
    const f = 294, d = kind === 'ta' ? 0.05 : kind === 'na' ? 0.1 : kind === 'dhin' ? 0.2 : 0.3;
    tone(out, t, { f: f, a: 0.002, d: d, peak: p });
    tone(out, t, { f: f * 2, a: 0.002, d: d * 0.7, peak: p * 0.5 });
    tone(out, t, { f: f * 3, a: 0.002, d: d * 0.5, peak: p * 0.25 });
    burst(out, t, { f: 3200, q: 2, a: 0.001, d: 0.01, peak: p * 0.4, off: 0.7 });
  }
  function bol(out, t, name, p) {
    if (name === 'dha') { bayan(out, t, p); dayan(out, t, 'tin', p * 0.8); }
    else if (name === 'dhin') { bayan(out, t, p); dayan(out, t, 'dhin', p * 0.7); }
    else if (name === 'tin') dayan(out, t, 'tin', p * 0.9);
    else if (name === 'ta') dayan(out, t, 'ta', p * 0.9);
    else if (name === 'na') dayan(out, t, 'na', p * 0.5);
    else if (name === 'ge') bayan(out, t, p * 0.55);
  }
  return {
    id: 'lB', trim: 0.3, stepDur: step, steps: 32,
    setup(out, h) {
      reedBed(out, h, mtof(50), 0.09);
      reedBed(out, h, mtof(57), 0.07);
      reedBed(out, h, mtof(62), 0.035);
    },
    onStep(i, t, h) {
      const out = h.out;
      if (i % 2 === 0) bol(out, t, THEKA[i >> 1], i === 0 ? 0.5 : 0.4);
      else if (ORN[i]) bol(out, t, ORN[i], 0.4);
      if (i === 0) {
        if (S.calm) bayan(out, t, 0.5);
        else {
          [50, 51, 57, 62, 68].forEach(m => reed(out, t, mtof(m), 1.3, 0.1, { a: 0.012, rel: 1.1, lp: 1700 }));
          bayan(out, t, 0.6);
        }
      }
      const ph = PHR[i];
      if (ph) ph.forEach(n => reed(out, t, mtof(n[1]), n[2] * step * 0.95, 0.13, { a: 0.06, rel: 0.14, vib: 7 }));
    }
  };
})();

const LC = (function () {
  const step = 0.25;
  const STROKES = { 2: 0.34, 14: 0.3, 26: 0.36, 38: 0.3 };
  const RUSTLE = [9, 19, 31, 44];
  function press(out, t, p) {
    burst(out, t, { f: 400, f2: 900, sweep: 0.5, q: 0.9, a: 0.35, d: 0.15, peak: p * 0.4, off: 0.2 });
    const k = t + 0.5;
    thump(out, k, { f: 200, f2: 95, glide: 0.1, d: 0.2, peak: p });
    burst(out, k, { f: 1500, q: 1, a: 0.001, d: 0.02, peak: p * 0.45, off: 0.9 });
    burst(out, k + 0.28, { f: 2000, q: 1, a: 0.002, d: 0.05, peak: p * 0.22, off: 1.4 });
  }
  function rustle(out, t) {
    const dt = [0, 0.07, 0.11, 0.19, 0.24, 0.33], fr = [3200, 4200, 2600, 5000, 3000, 3800];
    dt.forEach((x, j) => burst(out, t + x, { f: fr[j], q: 1.2, a: 0.002, d: 0.022, peak: 0.07, off: j * 0.31 }));
  }
  return {
    id: 'lC', trim: 0.7, stepDur: step, steps: 48,
    setup(out, h) {
      noiseBed(out, h, 'lowpass', 900, 0.7, 0.05, 0.3);
      noiseBed(out, h, 'highpass', 3500, 0.7, 0.006, 1.1);
    },
    onStep(i, t, h) {
      const out = h.out;
      if (STROKES[i]) press(out, t, STROKES[i]);
      if (RUSTLE.indexOf(i) >= 0) rustle(out, t);
      if (i === 22) burst(out, t, { f: 1800, f2: 900, sweep: 0.5, q: 0.8, a: 0.05, d: 0.45, peak: 0.07, off: 0.6 });
    }
  };
})();

const SA = (function () {
  const step = 0.5;
  function horn(out, t, dur, p) {
    const c = S.ctx, end = t + 0.4 + dur + 1.1;
    const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 560; fl.Q.value = 0.7;
    const g = env(out, t, 0.4, p, dur, 0.9);
    fl.connect(g);
    [233, 294, 349].forEach(f => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.975, t + 0.4 + dur + 1.0);
      o.connect(fl); o.start(t); o.stop(end);
    });
  }
  return {
    id: 'sA', trim: 0.25, stepDur: step, steps: 28,
    setup(out, h) {
      drone(out, h, 100, 0.03, 'sine', 400);
      drone(out, h, 200, 0.045, 'sine', 600);
      drone(out, h, 300, 0.022, 'sine', 800);
      drone(out, h, 100, 0.02, 'sawtooth', 450);
      murmur(out, h, 420, 0.8, 0.9, 0.23, 0.35, 0.2);
      murmur(out, h, 700, 0.9, 0.7, 3.7, 0.3, 0.9);
      murmur(out, h, 1500, 1.1, 0.35, 5.3, 0.15, 1.4);
    },
    onStep(i, t, h) {
      if (S.calm) return;
      if (i === 8) horn(h.out, t, 1.6, 0.1);
      if (i === 21) horn(h.out, t, 0.45, 0.08);
    }
  };
})();

const SB = (function () {
  const step = 0.25;
  const N = { 4: [69, 0.24, 1.6], 6: [76, 0.22, 1.4], 8: [73, 0.22, 1.4], 11: [71, 0.24, 2.2], 34: [69, 0.13, 1.4], 36: [76, 0.12, 1.4], 38: [73, 0.12, 2.0] };
  return {
    id: 'sB', trim: 0.8, stepDur: step, steps: 60,
    setup(out, h) {
      h.dly = makeDelay(out, 0.33, S.calm ? 0 : 0.35, S.calm ? 0 : 0.35, 3200);
    },
    onStep(i, t, h) {
      const n = N[i];
      if (n) bell(h.dly, t, mtof(n[0]), { peak: n[1], d: n[2], ratios: [1, 2.76, 5.4], gains: [1, 0.28, 0.1] });
    }
  };
})();

const SC = (function () {
  const bpm = 108, step = 60 / bpm / 3;
  const LEAD = [
    [0,0,1.5,69],[0,1.5,0.5,71],[0,2,2,74],
    [1,0,1,71],[1,1,1,69],[1,2,1,66],[1,3,1,69],
    [2,0,1.5,74],[2,1.5,0.5,76],[2,2,2,78],
    [3,0,1,76],[3,1,1,74],[3,2,1.5,71],[3,3.5,0.5,69],
    [4,1,1,69],[4,2,1,71],[4,3,1,74],
    [5,0,2,78],[5,2,1,76],[5,3,1,74],
    [6,0,1,71],[6,1,1,69],[6,2,0.5,66],[6,2.5,0.5,64],[6,3,1,62]
  ];
  const L = {};
  LEAD.forEach((n, j) => {
    const st = (n[0] * 4 + n[1]) * 3, k = Math.floor(st + 1e-6);
    const prev = LEAD[j - 1];
    const contiguous = prev && (prev[0] * 4 + prev[1] + prev[2]) === (n[0] * 4 + n[1]);
    if (!L[k]) L[k] = [];
    L[k].push({ m: n[3], dur: n[2] * 3 * step * 0.95, off: (st - k) * step, from: contiguous ? prev[3] : 0 });
  });
  function clack(out, t, acc, w) {
    if (acc) {
      burst(out, t, { f: 2300, q: 2.5, a: 0.001, d: 0.03, peak: 0.3 * w, off: 0.3 });
      tone(out, t, { f: 95, f2: 60, glide: 0.04, a: 0.002, d: 0.06, peak: 0.34 * w });
      burst(out, t, { f: 5200, q: 3, a: 0.001, d: 0.012, peak: 0.1, off: 1.2 });
    } else {
      burst(out, t, { f: 2800, q: 2.5, a: 0.001, d: 0.02, peak: 0.16, off: 0.8 });
    }
  }
  return {
    id: 'sC', trim: 0.25, stepDur: step, steps: 84,
    setup(out, h) {
      drone(out, h, mtof(50), 0.07, 'triangle', 500);
      drone(out, h, mtof(57), 0.045, 'triangle', 600);
    },
    onStep(i, t, h) {
      const out = h.out, s = i % 12, m = s % 3;
      if (m === 0) clack(out, t, true, s === 0 ? 1.15 : 0.85);
      else if (m === 2) clack(out, t, false, 1);
      if (i === 72) burst(out, t, { f: 300, f2: 900, sweep: 1.7, q: 0.8, a: 1.4, d: 0.5, peak: 0.14, off: 0.3 });
      const ld = L[i];
      if (ld && !S.calm) ld.forEach(n => reed(out, t + n.off, mtof(n.m), n.dur, 0.2, { a: 0.04, rel: 0.1, lp: 3800, pk: 1200, vib: 18, from: n.from ? mtof(n.from) : 0 }));
    }
  };
})();

const MUSIC = { lA: LA, lB: LB, lC: LC, sA: SA, sB: SB, sC: SC };
const loopLen = d => d.stepDur * d.steps;

function pump(L) {
  const c = S.ctx;
  if (L.next < c.currentTime - 0.1) L.next = c.currentTime + 0.05;
  while (L.next < c.currentTime + 0.2) {
    L.def.onStep(L.step % L.def.steps, L.next, L.h);
    L.next += L.def.stepDur;
    L.step++;
  }
}

function startLoop(def) {
  const c = ensureCtx();
  if (!c) return null;
  stopLoop();
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, c.currentTime);
  out.gain.linearRampToValueAtTime((def.trim || 1) * (S.calm ? 0.8 : 1), c.currentTime + 0.06);
  out.connect(S.bus);
  const t0 = c.currentTime + 0.1;
  const L = { def: def, out: out, t0: t0, next: t0, step: 0, timer: 0, keep: [], h: null };
  L.h = { out: out, t0: t0, keep: n => { L.keep.push(n); return n; } };
  def.setup(out, L.h);
  S.loop = L;
  pump(L);
  L.timer = setInterval(() => pump(L), 25);
  return L;
}

function stopLoop() {
  const L = S.loop;
  if (!L) return;
  S.loop = null;
  clearInterval(L.timer);
  const c = S.ctx, now = c.currentTime;
  L.out.gain.cancelScheduledValues(now);
  L.out.gain.setValueAtTime(L.out.gain.value, now);
  L.out.gain.linearRampToValueAtTime(0.0001, now + 0.08);
  setTimeout(() => {
    L.keep.forEach(n => { try { n.stop(); } catch (e) {} });
    try { L.out.disconnect(); } catch (e) {}
  }, 160);
}

function cutFx() {
  if (!S.ctx) return;
  const c = S.ctx, old = S.fx, now = c.currentTime;
  old.gain.cancelScheduledValues(now);
  old.gain.setValueAtTime(old.gain.value, now);
  old.gain.linearRampToValueAtTime(0, now + 0.03);
  setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 100);
  S.fx = c.createGain();
  S.fx.connect(S.bus);
}

function stopAll() { stopLoop(); cutFx(); }

return { S, FX, MUSIC, startLoop, stopLoop, ensureCtx };
})();
window.SND_W = (() => {

const S = { ctx: null, bus: null, comp: null, master: null, fx: null, noise: null, vol: 0.4, calm: false, loop: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(c) {
  const len = Math.floor(c.sampleRate * 2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  const r = mulberry(12345);
  for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
  return buf;
}

function buildChain(c, vol) {
  const bus = c.createGain();
  bus.gain.value = 0.9;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.knee.value = 12;
  comp.ratio.value = 8;
  comp.attack.value = 0.003;
  comp.release.value = 0.2;
  const master = c.createGain();
  master.gain.value = vol;
  bus.connect(comp);
  comp.connect(master);
  master.connect(c.destination);
  return { bus: bus, comp: comp, master: master };
}

function ensureCtx() {
  if (S.ctx) {
    if (S.ctx.state === 'suspended') S.ctx.resume();
    return S.ctx;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const c = new AC();
  S.ctx = c;
  S.noise = makeNoise(c);
  const ch = buildChain(c, S.vol);
  S.bus = ch.bus; S.comp = ch.comp; S.master = ch.master;
  S.fx = c.createGain();
  S.fx.connect(S.bus);
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b; s.connect(c.destination); s.start(0);
  if (c.state === 'suspended') c.resume();
  return c;
}

/* ---------- shared voices ---------- */
function env(out, t, a, peak, hold, d) {
  const c = S.ctx, g = c.createGain(), p = Math.max(peak, 0.0002), at = Math.max(a, 0.001);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(p, t + at);
  if (hold > 0) g.gain.setValueAtTime(p, t + at + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + at + hold + d);
  g.connect(out);
  return g;
}

function tone(out, t, o) {
  const c = S.ctx;
  const f = o.f, f2 = o.f2 || o.f, glide = o.glide || 0.05;
  const a = o.a === undefined ? 0.004 : o.a, hold = o.hold || 0, d = o.d || 0.1;
  const osc = c.createOscillator();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(f, t);
  if (f2 !== f) osc.frequency.exponentialRampToValueAtTime(f2, t + glide);
  let src = osc;
  if (o.lp) {
    const fl = c.createBiquadFilter();
    fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.Q.value = o.q || 0.7;
    osc.connect(fl); src = fl;
  }
  src.connect(env(out, t, a, o.peak === undefined ? 0.3 : o.peak, hold, d));
  osc.start(t);
  osc.stop(t + Math.max(a, 0.001) + hold + d + 0.04);
}

function burst(out, t, o) {
  const c = S.ctx;
  const a = o.a === undefined ? 0.002 : o.a, hold = o.hold || 0, d = o.d || 0.03;
  const src = c.createBufferSource();
  src.buffer = S.noise; src.loop = true;
  const fl = c.createBiquadFilter();
  fl.type = o.type || 'bandpass';
  fl.frequency.setValueAtTime(o.f || 2000, t);
  if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + (o.sweep || (a + hold + d)));
  fl.Q.value = o.q || 0.8;
  src.connect(fl);
  fl.connect(env(out, t, a, o.peak === undefined ? 0.2 : o.peak, hold, d));
  src.start(t, (o.off || 0) % 1.8);
  src.stop(t + Math.max(a, 0.001) + hold + d + 0.04);
}

function thump(out, t, o) {
  tone(out, t, { f: o.f, f2: o.f2, glide: o.glide, d: o.d, peak: o.peak * 0.4 });
  tone(out, t, { f: o.f, f2: o.f2, glide: o.glide, type: 'sawtooth', lp: 1600, d: o.d * 0.8, peak: o.peak * 0.36 });
}

function bell(out, t, f, o) {
  const r = o.ratios || [1, 2.76, 5.4], g = o.gains || [1, 0.35, 0.12];
  r.forEach((x, i) => tone(out, t, { f: f * x, a: 0.002, d: o.d / (1 + i * 0.9), peak: o.peak * g[i] }));
}

function makeDelay(out, time, fb, mix, cut) {
  const c = S.ctx;
  const input = c.createGain();
  const dly = c.createDelay(1.0);
  dly.delayTime.value = time;
  const fbg = c.createGain(); fbg.gain.value = fb;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut;
  const wet = c.createGain(); wet.gain.value = mix;
  input.connect(out);
  input.connect(dly);
  dly.connect(lp);
  lp.connect(fbg); fbg.connect(dly);
  lp.connect(wet); wet.connect(out);
  return input;
}

function drone(out, h, f, p, type, lpf) {
  const c = S.ctx, o = c.createOscillator();
  o.type = type; o.frequency.value = f;
  const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lpf;
  const g = c.createGain(); g.gain.value = p;
  o.connect(fl); fl.connect(g); g.connect(out);
  o.start(h.t0); h.keep(o);
}

function noiseBed(out, h, type, f, q, p, off) {
  const c = S.ctx, src = c.createBufferSource();
  src.buffer = S.noise; src.loop = true;
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = c.createGain(); g.gain.value = p;
  src.connect(fl); fl.connect(g); g.connect(out);
  src.start(h.t0, off || 0); h.keep(src);
  return g;
}

function wobble(h, param, rate, depth) {
  const c = S.ctx, l = c.createOscillator(), lg = c.createGain();
  l.frequency.value = rate; lg.gain.value = depth;
  l.connect(lg); lg.connect(param);
  l.start(h.t0); h.keep(l);
}

function murmur(out, h, f, q, base, rate, depth, off) {
  const g = noiseBed(out, h, 'bandpass', f, q, base, off);
  wobble(h, g.gain, rate, depth);
}

function bassPluck(out, t, m, p) {
  const f = mtof(m);
  tone(out, t, { f: f, type: 'triangle', a: 0.004, d: 0.45, peak: p, lp: 900 });
  tone(out, t, { f: f, type: 'sawtooth', a: 0.004, d: 0.3, peak: p * 0.3, lp: 700 });
}

/* ---------- Jadugar voices ---------- */
function pluck(out, t, f, o) {
  const c = S.ctx, d = o.d || 0.6, end = t + d + 0.06;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass'; lp.Q.value = o.q || 2;
  lp.frequency.setValueAtTime(Math.min(f * (o.bright || 8), 6500), t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.6, 320), t + d * 0.7);
  lp.connect(env(out, t, 0.002, o.peak || 0.2, 0, d));
  (o.det || [0]).forEach(dt => {
    const osc = c.createOscillator();
    osc.type = o.type || 'sawtooth'; osc.frequency.value = f; osc.detune.value = dt;
    osc.connect(lp); osc.start(t); osc.stop(end);
  });
}

function tarang(out, t, f, p, d) {
  pluck(out, t, f, { det: [-7, 0, 7], bright: 10, q: 3, d: d, peak: p / 3 });
  burst(out, t, { type: 'highpass', f: 5000, a: 0.001, d: 0.006, peak: p * 0.25, off: 0.3 });
}

function tarangNote(out, t, m, dur, p, trem) {
  const f = mtof(m);
  tarang(out, t, f, p, trem ? 0.3 : Math.min(0.9, dur + 0.3));
  if (trem) for (let x = t + 0.11; x < t + dur - 0.08; x += 0.11) tarang(out, x, f, p * 0.55, 0.22);
}

function dhol(out, t, bol, p) {
  if (bol === 'dha' || bol === 'dhin' || bol === 'ge') {
    tone(out, t, { f: 110, f2: 150, glide: 0.16, a: 0.003, d: 0.28, peak: p });
    tone(out, t, { f: 220, f2: 300, glide: 0.14, type: 'triangle', a: 0.003, d: 0.1, peak: p * 0.4 });
    burst(out, t, { type: 'lowpass', f: 650, a: 0.002, d: 0.03, peak: p * 0.3, off: 0.4 });
  }
  if (bol === 'dha' || bol === 'dhin' || bol === 'na' || bol === 'tin') {
    const k = bol === 'tin' ? 0.8 : 1;
    tone(out, t, { f: 560, a: 0.002, d: bol === 'dhin' ? 0.16 : 0.1, peak: p * 0.55 * k });
    tone(out, t, { f: 1130, a: 0.002, d: 0.05, peak: p * 0.2 * k });
    burst(out, t, { f: 2600, q: 1.4, a: 0.001, d: 0.012, peak: p * 0.35 * k, off: 0.8 });
  }
}

function manjira(out, t, open, p) {
  const d = open ? 0.45 : 0.06;
  [2130, 3270, 4410, 5650].forEach((f, i) => tone(out, t, { f: f, a: 0.001, d: d / (1 + i * 0.6), peak: p * [1, 0.6, 0.4, 0.25][i] }));
  burst(out, t, { type: 'highpass', f: 6000, a: 0.001, d: open ? 0.12 : 0.03, peak: p * 0.5, off: 1.2 });
}

function dugdugi(out, t, n, p) {
  for (let k = 0; k < n; k++) {
    const hi = k % 2 === 0, at = t + k * 0.055, sw = 0.5 + 0.5 * Math.sin(Math.PI * (k + 0.5) / n);
    tone(out, at, { f: hi ? 460 : 400, f2: hi ? 380 : 330, glide: 0.04, a: 0.001, d: 0.06, peak: p * sw });
    burst(out, at, { f: 1900, q: 1.3, a: 0.001, d: 0.012, peak: p * 0.35 * sw, off: 0.1 + k * 0.13 });
  }
}

function tanpura(out, t, f, p, d) {
  const c = S.ctx, end = t + d + 0.05;
  tone(out, t, { f: f, a: 0.004, d: d, peak: p * 0.5 });
  tone(out, t, { f: f * 2, a: 0.004, d: d * 0.7, peak: p * 0.25 });
  const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4;
  bp.frequency.setValueAtTime(Math.min(f * 10, 4000), t);
  bp.frequency.exponentialRampToValueAtTime(Math.max(f * 3, 400), t + d * 0.9);
  o.connect(bp); bp.connect(env(out, t, 0.004, p * 0.6, 0, d * 0.9));
  o.start(t); o.stop(end);
}

function glass(out, t, f, p, d) {
  tone(out, t, { f: f, a: 0.012, d: d, peak: p });
  tone(out, t, { f: f * 2, a: 0.01, d: d * 0.5, peak: p * 0.25 });
  tone(out, t, { f: f * 3, a: 0.008, d: d * 0.25, peak: p * 0.08 });
}

/* ---------- Cricket voices ---------- */
function pock(out, t, p, f) {
  const ff = f || 520;
  tone(out, t, { f: ff, f2: ff * 0.72, glide: 0.03, a: 0.001, d: 0.05, peak: p * 0.5 });
  burst(out, t, { type: 'lowpass', f: 1700, a: 0.001, d: 0.02, peak: p * 0.4, off: 0.25 });
}

function batTock(out, t, p) {
  tone(out, t, { f: 1180, a: 0.0008, d: 0.05, peak: p * 0.42 });
  tone(out, t, { f: 2410, a: 0.0008, d: 0.025, peak: p * 0.16 });
  tone(out, t, { f: 640, f2: 560, glide: 0.03, type: 'triangle', a: 0.001, d: 0.07, peak: p * 0.42 });
  burst(out, t, { f: 3000, q: 1.2, a: 0.0008, d: 0.01, peak: p * 0.32, off: 0.35 });
}

function farTock(out, t, p) {
  [[0, 1], [0.27, 0.28], [0.54, 0.09]].forEach(e => {
    tone(out, t + e[0], { f: 1100, a: 0.002, d: 0.05, peak: p * 0.3 * e[1] });
    tone(out, t + e[0], { f: 600, f2: 540, glide: 0.03, type: 'triangle', a: 0.002, d: 0.07, peak: p * 0.4 * e[1] });
    burst(out, t + e[0], { f: 1500, q: 1, a: 0.002, d: 0.02, peak: p * 0.2 * e[1], off: 0.6 });
  });
}

function glove(out, t, p) {
  burst(out, t, { f: 950, q: 0.8, a: 0.001, d: 0.05, peak: p * 0.55, off: 1.0 });
  thump(out, t, { f: 180, f2: 95, glide: 0.06, d: 0.1, peak: p * 0.6 });
  burst(out, t, { type: 'lowpass', f: 2400, a: 0.001, d: 0.012, peak: p * 0.25, off: 1.4 });
}

function plateClack(out, t, p) {
  tone(out, t, { f: 410, f2: 360, glide: 0.03, type: 'triangle', a: 0.001, d: 0.07, peak: p * 0.4 });
  tone(out, t, { f: 830, a: 0.001, d: 0.035, peak: p * 0.16 });
  burst(out, t, { f: 1500, q: 1.1, a: 0.001, d: 0.02, peak: p * 0.3, off: 0.45 });
  [0.028, 0.05, 0.078].forEach((dt, k) => burst(out, t + dt, { type: 'highpass', f: 4200, a: 0.001, d: 0.006, peak: p * [0.12, 0.08, 0.05][k], off: 0.9 + k * 0.17 }));
}

function brush(out, t, p, accent) {
  burst(out, t, { f: 2600, q: 0.7, a: 0.02, d: 0.1, peak: p, off: (t * 0.37) % 1.7 });
  if (accent) burst(out, t, { f: 1800, q: 1, a: 0.002, d: 0.05, peak: p * 1.6, off: 0.9 });
}

function clar(out, t, f, dur, p) {
  const c = S.ctx, a = 0.03, rel = 0.09, end = t + dur + 0.06;
  const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.7;
  o.connect(lp); lp.connect(env(out, t, a, p, Math.max(0, dur - a - rel), rel));
  if (dur > 0.35) {
    const l = c.createOscillator(), lg = c.createGain();
    l.frequency.value = 5;
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(9, t + dur);
    l.connect(lg); lg.connect(o.detune);
    l.start(t); l.stop(end);
  }
  o.start(t); o.stop(end);
}

function radioChain(out) {
  const c = S.ctx;
  const inp = c.createGain();
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 420; hp.Q.value = 0.7;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3300; lp.Q.value = 0.9;
  const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1400; pk.gain.value = 4; pk.Q.value = 0.9;
  const ws = c.createWaveShaper();
  const n = 1024, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curve[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); }
  ws.curve = curve;
  inp.connect(hp); hp.connect(lp); lp.connect(pk); pk.connect(ws); ws.connect(out);
  return inp;
}

/* ---------- Rukavat voices ---------- */
function knobClick(out, t, p, f) {
  const k = f || 1;
  burst(out, t, { type: 'highpass', f: 3000, a: 0.0008, d: 0.006, peak: p * 0.5, off: 0.15 });
  tone(out, t, { f: 900 * k, f2: 700 * k, glide: 0.01, type: 'triangle', a: 0.0008, d: 0.022, peak: p * 0.35 });
  burst(out, t + 0.008, { f: 1700 * k, q: 2, a: 0.0008, d: 0.012, peak: p * 0.35, off: 0.55 });
}

function softTone(out, t, f, p, hold, d, wow) {
  const c = S.ctx, end = t + 0.03 + hold + d + 0.05;
  const o1 = c.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
  const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = 0.7;
  const g2 = c.createGain(); g2.gain.value = 0.18;
  o1.connect(lp); o2.connect(g2); g2.connect(lp);
  lp.connect(env(out, t, 0.03, p, hold, d));
  if (wow) {
    const l = c.createOscillator(), lg = c.createGain();
    l.frequency.value = 4.2; lg.gain.value = 6;
    l.connect(lg); lg.connect(o1.detune); lg.connect(o2.detune);
    l.start(t); l.stop(end);
  }
  o1.start(t); o2.start(t); o1.stop(end); o2.stop(end);
}

function strike(out, t, f, p, d) {
  tone(out, t, { f: f, a: 0.002, d: d, peak: p });
  tone(out, t, { f: f * 2.003, a: 0.002, d: d * 0.55, peak: p * 0.32 });
  tone(out, t, { f: f * 3.01, a: 0.002, d: d * 0.3, peak: p * 0.12 });
  burst(out, t, { f: 4200, q: 1.5, a: 0.001, d: 0.008, peak: p * 0.35, off: f % 1.7 });
}

function santoor(out, t, m, rollDur, p) {
  const f = mtof(m);
  if (!rollDur || S.calm) { strike(out, t, f, p, 1.2); return; }
  const n = Math.max(2, Math.round(rollDur / 0.09));
  for (let k = 0; k < n; k++) strike(out, t + k * 0.09, f, p * (k % 2 ? 0.5 : 0.72) * (1 - 0.3 * k / n), k === n - 1 ? 1.0 : 0.3);
}

function rukCut(o, t, withTone) {
  if (S.calm) {
    if (withTone) softTone(o, t, 587, 0.09, 0.1, 0.16, false);
    burst(o, t + 0.3, { type: 'highpass', f: 2600, a: 0.001, d: 0.012, peak: 0.2, off: 0.7 });
    tone(o, t + 0.3, { f: 190, f2: 120, glide: 0.05, type: 'triangle', d: 0.07, peak: 0.24 });
    return;
  }
  burst(o, t, { type: 'lowpass', f: 700, a: 0.003, d: 0.05, peak: 0.22, off: 0.3 });
  tone(o, t, { f: 170, f2: 120, glide: 0.06, type: 'triangle', d: 0.07, peak: 0.22 });
  burst(o, t + 0.04, { f: 1200, f2: 700, sweep: 0.2, q: 0.8, a: 0.04, d: 0.16, peak: 0.08, off: 0.9 });
  if (withTone) softTone(o, t + 0.2, 587, 0.1, 0.26, 0.26, true);
  burst(o, t + 0.76, { type: 'highpass', f: 2600, a: 0.001, d: 0.012, peak: 0.22, off: 0.7 });
  tone(o, t + 0.76, { f: 190, f2: 120, glide: 0.05, type: 'triangle', d: 0.07, peak: 0.26 });
  burst(o, t + 0.8, { f: 3000, f2: 900, sweep: 0.32, q: 0.6, a: 0.06, d: 0.28, peak: 0.07, off: 1.3 });
  tone(o, t + 0.82, { f: 100, type: 'triangle', a: 0.12, hold: 0.06, d: 0.15, peak: 0.12 });
}

/* ---------- sound effects: functions of time only ---------- */
const FX = {
  jadugar: {
    tap(t, o) {
      burst(o, t, { type: 'lowpass', f: 1400, a: 0.002, d: 0.035, peak: 0.34, off: 0.2 });
      tone(o, t, { f: 240, f2: 190, glide: 0.03, type: 'triangle', d: 0.05, peak: 0.3 });
      burst(o, t, { f: 3400, q: 1.4, a: 0.001, d: 0.008, peak: 0.08, off: 0.7 });
    },
    unpick(t, o) {
      burst(o, t, { type: 'lowpass', f: 1100, a: 0.002, d: 0.03, peak: 0.24, off: 0.2 });
      tone(o, t, { f: 200, f2: 165, glide: 0.03, type: 'triangle', d: 0.045, peak: 0.22 });
    },
    commit(t, o) {
      tone(o, t, { f: 880, f2: 760, glide: 0.02, type: 'triangle', a: 0.001, d: 0.04, peak: 0.26 });
      burst(o, t, { f: 2200, q: 1.6, a: 0.001, d: 0.012, peak: 0.22, off: 0.5 });
      thump(o, t + 0.09, { f: 220, f2: 105, glide: 0.1, d: 0.2, peak: 0.8 });
      tone(o, t + 0.09, { f: 300, f2: 170, glide: 0.08, type: 'triangle', d: 0.1, peak: 0.28 });
      burst(o, t + 0.09, { type: 'lowpass', f: 1600, a: 0.002, d: 0.04, peak: 0.25, off: 1.0 });
    },
    refuse(t, o) {
      [0, 0.11].forEach(dt => {
        tone(o, t + dt, { f: 250, f2: 215, glide: 0.04, type: 'triangle', d: 0.07, peak: 0.34, lp: 900 });
        burst(o, t + dt, { type: 'lowpass', f: 650, a: 0.002, d: 0.02, peak: 0.12, off: 0.3 });
      });
    },
    fill(t, o) {
      burst(o, t, { f: 1800, f2: 2800, sweep: 0.06, q: 0.9, a: 0.02, d: 0.04, peak: 0.12, off: 0.9 });
      burst(o, t + 0.06, { f: 2600, q: 1.5, a: 0.001, d: 0.01, peak: 0.2, off: 1.2 });
      tone(o, t + 0.06, { f: 620, f2: 540, glide: 0.02, type: 'triangle', d: 0.05, peak: 0.24 });
    },
    spend(t, o) {
      burst(o, t, { f: 3000, q: 1.3, a: 0.001, d: 0.01, peak: 0.18, off: 0.3 });
      burst(o, t + 0.035, { f: 2400, q: 1.3, a: 0.001, d: 0.01, peak: 0.14, off: 0.6 });
      burst(o, t + 0.07, { type: 'lowpass', f: 1300, a: 0.002, d: 0.04, peak: 0.36, off: 0.9 });
      tone(o, t + 0.07, { f: 230, f2: 180, glide: 0.03, type: 'triangle', d: 0.06, peak: 0.32 });
    },
    result(t, o) {
      if (S.calm) {
        burst(o, t, { f: 900, f2: 1800, sweep: 0.2, q: 0.7, a: 0.06, d: 0.16, peak: 0.14, off: 0.4 });
        burst(o, t + 0.24, { type: 'lowpass', f: 1500, a: 0.002, d: 0.04, peak: 0.28, off: 0.8 });
        tone(o, t + 0.24, { f: 260, f2: 200, glide: 0.04, type: 'triangle', d: 0.07, peak: 0.24 });
        return;
      }
      const s = t + 0.3;
      burst(o, s, { f: 700, f2: 2200, sweep: 0.6, q: 0.6, a: 0.35, hold: 0.1, d: 0.4, peak: 0.2, off: 0.2 });
      burst(o, s + 0.05, { type: 'lowpass', f: 500, f2: 900, sweep: 0.5, a: 0.3, d: 0.4, peak: 0.12, off: 1.1 });
      [0.26, 0.37, 0.47].forEach((dt, k) => burst(o, s + dt, { f: [1500, 1800, 1650][k], q: 2.2, a: 0.001, d: 0.01, peak: 0.07, off: 0.5 + k * 0.29 }));
      burst(o, t + 1.12, { type: 'lowpass', f: 1500, a: 0.002, d: 0.04, peak: 0.28, off: 0.8 });
      tone(o, t + 1.12, { f: 260, f2: 200, glide: 0.04, type: 'triangle', d: 0.07, peak: 0.24 });
    },
    resultFlourish(t, o) {
      FX.jadugar.result(t, o);
      if (!S.calm) [74, 78, 81].forEach((m, k) => glass(o, t + 0.98 + k * 0.07, mtof(m), 0.12, 0.9));
    },
    milestone(t, o) {
      burst(o, t, { f: 2600, q: 1.2, a: 0.001, d: 0.012, peak: 0.3, off: 0.5 });
      thump(o, t + 0.01, { f: 230, f2: 110, glide: 0.09, d: 0.2, peak: 0.8 });
      burst(o, t + 0.01, { type: 'lowpass', f: 1400, a: 0.002, d: 0.06, peak: 0.34, off: 1.1 });
      if (!S.calm) bell(o, t + 0.16, 880, { peak: 0.2, d: 0.9, ratios: [1, 2.72, 4.95], gains: [1, 0.22, 0.07] });
    },
    open(t, o) {
      burst(o, t, { f: 1200, f2: 3000, sweep: 0.15, q: 0.9, a: 0.05, d: 0.1, peak: 0.12, off: 0.5 });
      [0, 0.025, 0.05, 0.075, 0.1, 0.125].forEach((dt, k) => burst(o, t + dt, { f: 2400 + k * 180, q: 1.6, a: 0.001, d: 0.008, peak: 0.1, off: 0.2 + k * 0.21 }));
      tone(o, t + 0.15, { f: 330, f2: 290, glide: 0.03, type: 'triangle', d: 0.05, peak: 0.16 });
    },
    close(t, o) {
      burst(o, t, { f: 3000, f2: 1200, sweep: 0.13, q: 0.9, a: 0.04, d: 0.09, peak: 0.11, off: 0.5 });
      [0, 0.03, 0.06, 0.09, 0.12].forEach((dt, k) => burst(o, t + dt, { f: 3000 - k * 200, q: 1.6, a: 0.001, d: 0.008, peak: 0.09, off: 0.3 + k * 0.19 }));
      tone(o, t + 0.14, { f: 280, f2: 240, glide: 0.03, type: 'triangle', d: 0.05, peak: 0.16 });
    },
    tab(t, o) {
      burst(o, t, { f: 2800, q: 1.2, a: 0.001, d: 0.012, peak: 0.34, off: 0.4 });
      burst(o, t + 0.02, { type: 'lowpass', f: 1300, a: 0.002, d: 0.03, peak: 0.3, off: 0.9 });
      tone(o, t + 0.02, { f: 300, f2: 240, glide: 0.02, type: 'triangle', d: 0.03, peak: 0.16 });
    },
    toast(t, o) {
      tone(o, t, { f: 988, f2: 970, glide: 0.1, type: 'triangle', d: 0.16, peak: 0.2 });
      tone(o, t, { f: 2680, a: 0.001, d: 0.05, peak: 0.03 });
    },
    cover(t, o) {
      dugdugi(o, t, 8, 0.3);
    }
  },
  cricket: {
    tap(t, o) { pock(o, t, 0.55); },
    unpick(t, o) { pock(o, t, 0.36, 430); },
    commit(t, o) {
      batTock(o, t, 0.9);
      tone(o, t, { f: 1180, a: 0.001, d: 0.16, peak: 0.05 });
      burst(o, t + 0.006, { type: 'lowpass', f: 900, a: 0.002, d: 0.05, peak: 0.18, off: 1.3 });
    },
    refuse(t, o) {
      [0, 0.12].forEach(dt => {
        tone(o, t + dt, { f: 210, f2: 180, glide: 0.04, type: 'triangle', d: 0.06, peak: 0.32, lp: 800 });
        burst(o, t + dt, { type: 'lowpass', f: 500, a: 0.002, d: 0.025, peak: 0.14, off: 0.5 });
      });
    },
    fill(t, o) { plateClack(o, t, 0.6); },
    spend(t, o) { glove(o, t, 0.6); },
    result(t, o) {
      if (S.calm) { plateClack(o, t, 0.9); return; }
      burst(o, t, { type: 'highpass', f: 2500, a: 0.001, d: 0.008, peak: 0.2, off: 0.2 });
      tone(o, t, { f: 140, type: 'triangle', a: 0.001, d: 0.05, peak: 0.2 });
      tone(o, t + 0.02, { f: 200, a: 0.08, hold: 0.38, d: 0.1, peak: 0.05 });
      tone(o, t + 0.02, { f: 300, a: 0.08, hold: 0.38, d: 0.1, peak: 0.03 });
      burst(o, t + 0.02, { f: 1000, q: 2, a: 0.08, hold: 0.38, d: 0.1, peak: 0.015, off: 0.9 });
      [0.6, 0.78, 0.96].forEach(dt => plateClack(o, t + dt, 0.85));
    },
    milestone(t, o) {
      thump(o, t, { f: 200, f2: 95, glide: 0.09, d: 0.22, peak: 0.8 });
      plateClack(o, t, 1);
      if (!S.calm) bell(o, t + 0.16, 784, { peak: 0.2, d: 1.0, ratios: [1, 2.4, 4.6], gains: [1, 0.25, 0.08] });
    },
    open(t, o) {
      burst(o, t, { f: 500, f2: 1500, sweep: 0.16, q: 0.5, a: 0.05, d: 0.12, peak: 0.18, off: 0.7 });
      tone(o, t + 0.16, { f: 200, f2: 170, glide: 0.04, type: 'triangle', d: 0.05, peak: 0.2 });
    },
    close(t, o) {
      burst(o, t, { f: 1500, f2: 500, sweep: 0.14, q: 0.5, a: 0.04, d: 0.11, peak: 0.17, off: 0.7 });
      tone(o, t + 0.14, { f: 180, f2: 150, glide: 0.04, type: 'triangle', d: 0.05, peak: 0.2 });
    },
    tab(t, o) {
      burst(o, t, { type: 'highpass', f: 2800, a: 0.002, d: 0.03, peak: 0.14, off: 0.6 });
      burst(o, t + 0.02, { f: 1300, q: 1, a: 0.002, d: 0.02, peak: 0.12, off: 0.9 });
    },
    toast(t, o) {
      plateClack(o, t, 0.4);
      tone(o, t + 0.01, { f: 740, type: 'triangle', a: 0.002, d: 0.14, peak: 0.16 });
    },
    cover(t, o) { farTock(o, t, 0.7); }
  },
  rukavat: {
    tap(t, o) { knobClick(o, t, 0.55); },
    unpick(t, o) { knobClick(o, t, 0.38, 0.85); },
    commit(t, o) {
      burst(o, t, { type: 'highpass', f: 3200, a: 0.001, d: 0.008, peak: 0.28, off: 0.4 });
      tone(o, t, { f: 1300, a: 0.001, d: 0.015, peak: 0.1 });
      thump(o, t + 0.05, { f: 210, f2: 100, glide: 0.09, d: 0.18, peak: 0.75 });
      tone(o, t + 0.05, { f: 280, f2: 160, glide: 0.08, type: 'triangle', d: 0.1, peak: 0.26 });
      [0.12, 0.15, 0.19].forEach((dt, k) => burst(o, t + dt, { type: 'highpass', f: 5000, a: 0.001, d: 0.004, peak: 0.06, off: 1.1 + k * 0.2 }));
    },
    refuse(t, o) {
      [0, 0.12].forEach(dt => {
        tone(o, t + dt, { f: 230, f2: 200, glide: 0.04, type: 'triangle', d: 0.08, peak: 0.36, lp: 850 });
        burst(o, t + dt, { type: 'lowpass', f: 600, a: 0.002, d: 0.02, peak: 0.12, off: 0.35 });
      });
    },
    fill(t, o) {
      burst(o, t, { f: 1500, f2: 2400, sweep: 0.06, q: 0.9, a: 0.02, d: 0.05, peak: 0.12, off: 0.8 });
      burst(o, t + 0.06, { type: 'highpass', f: 3500, a: 0.001, d: 0.008, peak: 0.14, off: 1.1 });
      tone(o, t + 0.06, { f: 560, f2: 500, glide: 0.02, type: 'triangle', d: 0.05, peak: 0.24 });
    },
    spend(t, o) {
      knobClick(o, t, 0.7);
      thump(o, t, { f: 300, f2: 160, glide: 0.05, d: 0.08, peak: 0.4 });
      knobClick(o, t + 0.035, 0.35, 1.2);
    },
    result(t, o) { rukCut(o, t, true); },
    resultNoTone(t, o) { rukCut(o, t, false); },
    milestone(t, o) {
      thump(o, t, { f: 220, f2: 105, glide: 0.09, d: 0.2, peak: 0.8 });
      burst(o, t, { type: 'lowpass', f: 1200, a: 0.002, d: 0.05, peak: 0.3, off: 0.6 });
      if (!S.calm) strike(o, t + 0.16, mtof(79), 0.2, 1.1);
    },
    open(t, o) {
      burst(o, t, { type: 'lowpass', f: 450, f2: 800, sweep: 0.15, a: 0.04, hold: 0.08, d: 0.06, peak: 0.2, off: 0.4 });
      burst(o, t, { f: 900, q: 3, a: 0.04, hold: 0.08, d: 0.06, peak: 0.05, off: 1.2 });
      tone(o, t + 0.17, { f: 260, f2: 210, glide: 0.03, type: 'triangle', d: 0.05, peak: 0.22 });
    },
    close(t, o) {
      burst(o, t, { type: 'lowpass', f: 700, f2: 400, sweep: 0.15, a: 0.04, hold: 0.07, d: 0.06, peak: 0.19, off: 0.4 });
      burst(o, t, { f: 800, q: 3, a: 0.04, hold: 0.07, d: 0.06, peak: 0.05, off: 1.2 });
      tone(o, t + 0.16, { f: 230, f2: 190, glide: 0.03, type: 'triangle', d: 0.05, peak: 0.22 });
    },
    tab(t, o) { knobClick(o, t, 0.42); },
    toast(t, o) { softTone(o, t, 659, 0.16, 0.02, 0.16, false); },
    cover(t, o) {
      knobClick(o, t, 0.5);
      knobClick(o, t + 0.09, 0.45);
      burst(o, t + 0.12, { f: 2400, f2: 1200, sweep: 0.3, q: 0.5, a: 0.03, hold: 0.12, d: 0.2, peak: 0.07, off: 0.9 });
      tone(o, t + 0.3, { f: 200, type: 'triangle', a: 0.1, d: 0.2, peak: 0.05 });
    }
  }
};

/* ---------- music loops ---------- */
function keyed(bars, per) {
  const m = {};
  bars.forEach((arr, b) => arr.forEach(n => {
    const k = b * per + n[0];
    if (!m[k]) m[k] = [];
    m[k].push(n);
  }));
  return m;
}

const JA = (function () {
  const step = 0.3;
  const THEKA = ['dha', 'dhin', 'na', 'dha', 'tin', 'na'];
  const MEL = keyed([
    [[0, 69, 3], [3, 71, 1], [4, 69, 2], [6, 66, 2], [8, 67, 2], [10, 69, 2]],
    [[0, 74, 4], [4, 72, 2], [6, 71, 2], [8, 69, 4]],
    [[0, 67, 3], [3, 66, 1], [4, 64, 2], [6, 66, 2], [8, 67, 2], [10, 66, 2]],
    [[0, 64, 2], [2, 62, 6]]
  ], 12);
  const BASS = [[50, 57], [50, 55], [48, 55], [50, 45]];
  return {
    id: 'jA', trim: 0.3, stepDur: step, steps: 48,
    setup(out, h) { h.dly = makeDelay(out, 0.3, S.calm ? 0 : 0.2, S.calm ? 0 : 0.18, 2800); },
    onStep(i, t, h) {
      const bar = Math.floor(i / 12), s = i % 12, out = h.out;
      if (s % 2 === 0) dhol(out, t, THEKA[s / 2], s === 0 ? 0.46 : 0.38);
      else if (!S.calm && (s === 5 || s === 11)) dhol(out, t, 'na', 0.16);
      if (s === 0 || s === 6) bassPluck(out, t, BASS[bar][s / 6], 0.3);
      if (!S.calm) {
        if (s === 0 || s === 6) manjira(out, t, true, 0.045);
        else if (s === 3 || s === 9) manjira(out, t, false, 0.03);
      }
      const ms = MEL[i];
      if (ms) ms.forEach(n => tarangNote(h.dly, t, n[1], n[2] * step, 0.2, n[2] >= 4 && !S.calm));
    }
  };
})();

const JB = (function () {
  const step = 0.3;
  const PL = { 0: [57, 0.15], 4: [62, 0.12], 8: [62, 0.11], 12: [50, 0.16] };
  return {
    id: 'jB', trim: 0.6, stepDur: step, steps: 48,
    setup(out, h) {
      noiseBed(out, h, 'bandpass', 2600, 0.6, 0.012, 0.4);
      const g = noiseBed(out, h, 'lowpass', 520, 0.7, 0.03, 1.0);
      wobble(h, g.gain, 0.23, 0.01);
    },
    onStep(i, t, h) {
      const p = PL[i % 16];
      if (p) tanpura(h.out, t, mtof(p[0]), p[1], 4.4);
      if (i === 40 && !S.calm) dugdugi(h.out, t, 8, 0.2);
    }
  };
})();

const JC = (function () {
  const step = 0.25;
  return {
    id: 'jC', trim: 0.8, stepDur: step, steps: 64,
    setup(out, h) { h.dly = makeDelay(out, 0.34, S.calm ? 0 : 0.35, S.calm ? 0 : 0.32, 3000); },
    onStep(i, t, h) {
      if (i === 4) [74, 75, 78, 81, 82].forEach((m, k) => glass(h.dly, t + k * 0.17, mtof(m), 0.15 - k * 0.01, 2.4));
      if (i === 36) [81, 78, 74].forEach((m, k) => glass(h.dly, t + k * 0.22, mtof(m), 0.08, 2.4));
    }
  };
})();

const CA = (function () {
  const step = 0.5;
  return {
    id: 'cA', trim: 0.2, stepDur: step, steps: 32,
    setup(out, h) {
      drone(out, h, 100, 0.022, 'sine', 400);
      drone(out, h, 200, 0.03, 'sine', 600);
      drone(out, h, 300, 0.012, 'sine', 800);
      murmur(out, h, 450, 0.8, 0.55, 0.19, 0.22, 0.3);
      murmur(out, h, 820, 0.9, 0.4, 2.9, 0.16, 0.9);
      murmur(out, h, 1600, 1.1, 0.14, 4.7, 0.06, 1.4);
    },
    onStep(i, t, h) {
      if (!S.calm && (i === 6 || i === 22)) farTock(h.out, t, 0.5);
    }
  };
})();

const CB = (function () {
  const bpm = 104, step = 60 / bpm / 3;
  const MEL = keyed([
    [[0, 72, 3], [3, 69, 2], [5, 72, 1], [6, 74, 3], [9, 72, 3]],
    [[0, 69, 5], [5, 65, 1], [6, 67, 6]],
    [[0, 70, 3], [3, 67, 2], [5, 70, 1], [6, 72, 3], [9, 70, 3]],
    [[0, 69, 9]],
    [[0, 74, 3], [3, 72, 2], [5, 70, 1], [6, 69, 3], [9, 70, 3]],
    [[0, 72, 5], [5, 69, 1], [6, 65, 6]],
    [[0, 67, 3], [3, 69, 2], [5, 70, 1], [6, 64, 3], [9, 67, 3]],
    [[0, 65, 6]]
  ], 12);
  const CH = [[65, 69, 72], [65, 70, 74], [64, 67, 70], [65, 69, 72], [65, 70, 74], [65, 69, 72], [64, 67, 70], [65, 69, 72]];
  const BASS = [[53, 60], [58, 53], [60, 55], [53, 60], [58, 53], [53, 57], [60, 55], [53, 48]];
  const CRACKLE = [17, 58, 83];
  return {
    id: 'cB', trim: 0.32, stepDur: step, steps: 96,
    setup(out, h) {
      h.radio = radioChain(out);
      if (!S.calm) noiseBed(h.radio, h, 'bandpass', 3600, 0.5, 0.016, 0.7);
    },
    onStep(i, t, h) {
      const bar = Math.floor(i / 12), s = i % 12, r = h.radio;
      if (s % 3 === 0) brush(r, t, 0.05, s === 3 || s === 9);
      else if (s % 3 === 2 && !S.calm) brush(r, t, 0.025, false);
      if (s === 0 || s === 6) bassPluck(r, t, BASS[bar][s / 6], 0.34);
      if (s === 3 || s === 9) CH[bar].forEach(m => tone(r, t, { f: mtof(m), type: 'triangle', a: 0.004, d: 0.14, peak: 0.05 }));
      if (S.calm) return;
      const ms = MEL[i];
      if (ms) ms.forEach(n => clar(r, t, mtof(n[1]), n[2] * step * 0.95, 0.045));
      if (CRACKLE.indexOf(i) >= 0) burst(r, t, { type: 'highpass', f: 2500, a: 0.001, d: 0.006, peak: 0.08, off: (i * 0.137) % 1.7 });
    }
  };
})();

const CC = (function () {
  const bpm = 92, step = 60 / bpm / 4;
  const BASS = { 0: 48, 3: 48, 6: 55, 8: 53, 11: 53, 14: 52 };
  return {
    id: 'cC', trim: 0.3, stepDur: step, steps: 64,
    setup() {},
    onStep(i, t, h) {
      const s = i % 16, out = h.out;
      if (s === 0 || s === 10) { thump(out, t, { f: 150, f2: 85, glide: 0.06, d: 0.14, peak: 0.6 }); batTock(out, t, 0.35); }
      if (s === 4 || s === 12) glove(out, t, 0.55);
      if (!S.calm && (s === 2 || s === 6 || s === 14)) burst(out, t, { f: 4800, f2: 3600, sweep: 0.05, q: 0.8, a: 0.008, d: 0.04, peak: 0.035, off: (s * 0.11) % 1.7 });
      if (BASS[s] !== undefined) bassPluck(out, t, BASS[s] + (Math.floor(i / 16) === 3 ? -2 : 0), 0.28);
    }
  };
})();

const RA = (function () {
  const step = 0.25;
  const PH = { 0: [66, 0], 1: [69, 0], 2: [71, 4], 7: [73, 0], 8: [71, 0], 9: [69, 0], 10: [71, 3],
    16: [74, 5], 22: [73, 0], 23: [71, 0], 24: [69, 1], 26: [67, 5],
    40: [71, 0], 41: [74, 0], 42: [78, 1], 44: [79, 5], 52: [76, 0], 53: [74, 4] };
  return {
    id: 'rA', trim: 0.4, stepDur: step, steps: 64,
    setup(out, h) {
      drone(out, h, mtof(55), 0.035, 'sine', 900);
      drone(out, h, mtof(62), 0.022, 'sine', 900);
      drone(out, h, mtof(43), 0.02, 'triangle', 500);
      h.dly = makeDelay(out, 0.36, S.calm ? 0 : 0.26, S.calm ? 0 : 0.28, 3200);
    },
    onStep(i, t, h) {
      const p = PH[i];
      if (p) santoor(h.dly, t, p[0], p[1] * step, 0.17);
    }
  };
})();

const RB = (function () {
  const step = 0.5;
  function clink(out, t, f, p) { bell(out, t, f, { peak: p, d: 0.5, ratios: [1, 2.62, 4.9], gains: [1, 0.3, 0.12] }); }
  return {
    id: 'rB', trim: 0.6, stepDur: step, steps: 32,
    setup(out, h) {
      const g = noiseBed(out, h, 'bandpass', 380, 0.7, 0.07, 0.2);
      wobble(h, g.gain, 1.25, 0.02);
      noiseBed(out, h, 'highpass', 2500, 0.7, 0.004, 0.9);
      drone(out, h, 100, 0.016, 'sine', 300);
      drone(out, h, 200, 0.012, 'triangle', 500);
    },
    onStep(i, t, h) {
      if (S.calm) return;
      if (i === 9) { clink(h.out, t, 2150, 0.06); clink(h.out, t + 0.13, 1720, 0.045); }
      if (i === 25) clink(h.out, t, 1900, 0.05);
    }
  };
})();

const RC = (function () {
  const step = 0.25;
  return {
    id: 'rC', trim: 0.8, stepDur: step, steps: 64,
    setup(out, h) { h.dly = makeDelay(out, 0.36, S.calm ? 0 : 0.28, S.calm ? 0 : 0.3, 3200); },
    onStep(i, t, h) {
      const out = h.out;
      if (i === 2) { knobClick(out, t, 0.5); knobClick(out, t + 0.22, 0.45); knobClick(out, t + 0.5, 0.5); }
      if (i === 5 && !S.calm) burst(out, t, { f: 2600, f2: 1100, sweep: 0.6, q: 0.5, a: 0.06, hold: 0.25, d: 0.35, peak: 0.06, off: 0.7 });
      if (i === 9) [71, 74, 78].forEach((m, k) => santoor(h.dly, t + k * 0.3, m, 0, 0.15));
    }
  };
})();

const MUSIC = { jA: JA, jB: JB, jC: JC, cA: CA, cB: CB, cC: CC, rA: RA, rB: RB, rC: RC };
const loopLen = d => d.stepDur * d.steps;

function pump(L) {
  const c = S.ctx;
  if (L.next < c.currentTime - 0.1) L.next = c.currentTime + 0.05;
  while (L.next < c.currentTime + 0.2) {
    L.def.onStep(L.step % L.def.steps, L.next, L.h);
    L.next += L.def.stepDur;
    L.step++;
  }
}

function startLoop(def) {
  const c = ensureCtx();
  if (!c) return null;
  stopLoop();
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, c.currentTime);
  out.gain.linearRampToValueAtTime((def.trim || 1) * (S.calm ? 0.8 : 1), c.currentTime + 0.06);
  out.connect(S.bus);
  const t0 = c.currentTime + 0.1;
  const L = { def: def, out: out, t0: t0, next: t0, step: 0, timer: 0, keep: [], h: null, fading: false };
  L.h = { out: out, t0: t0, keep: n => { L.keep.push(n); return n; } };
  def.setup(out, L.h);
  S.loop = L;
  pump(L);
  L.timer = setInterval(() => pump(L), 25);
  return L;
}

function stopLoop() {
  const L = S.loop;
  if (!L) return;
  S.loop = null;
  clearInterval(L.timer);
  const c = S.ctx, now = c.currentTime;
  L.out.gain.cancelScheduledValues(now);
  L.out.gain.setValueAtTime(L.out.gain.value, now);
  L.out.gain.linearRampToValueAtTime(0.0001, now + 0.08);
  setTimeout(() => {
    L.keep.forEach(n => { try { n.stop(); } catch (e) {} });
    try { L.out.disconnect(); } catch (e) {}
  }, 160);
}

function fadeLoop(sec, done) {
  const L = S.loop;
  if (!L || L.fading) return false;
  L.fading = true;
  const now = S.ctx.currentTime;
  L.out.gain.cancelScheduledValues(now);
  L.out.gain.setValueAtTime(L.out.gain.value, now);
  L.out.gain.linearRampToValueAtTime(0.0001, now + sec);
  setTimeout(() => { if (S.loop === L) { stopLoop(); if (done) done(); } }, sec * 1000 + 100);
  return true;
}

function cutFx() {
  if (!S.ctx) return;
  const c = S.ctx, old = S.fx, now = c.currentTime;
  old.gain.cancelScheduledValues(now);
  old.gain.setValueAtTime(old.gain.value, now);
  old.gain.linearRampToValueAtTime(0, now + 0.03);
  setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 100);
  S.fx = c.createGain();
  S.fx.connect(S.bus);
}

function stopAll() { stopLoop(); cutFx(); }

return { S, FX, MUSIC, startLoop, stopLoop, ensureCtx };
})();
