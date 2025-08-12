function seededRand(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}

export function parseCsvRaw(raw) {
  // simple CSV parser (dataset is clean: commas, no quoted commas)
  const lines = raw.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const rows = lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] || "").toLowerCase()));
    return obj;
  });
  return { headers, rows };
}

export function buildMatrices(rows) {
  const symptomCols = Object.keys(rows[0]).filter(c => c.startsWith("symptom"));
  const targetCol = "prognosis" in rows[0] ? "prognosis" : "disease";

  // vocab
  const vocabSet = new Set();
  rows.forEach(r => {
    symptomCols.forEach(c => { if (r[c] && r[c] !== "nan") vocabSet.add(r[c]); });
  });
  const vocab = Array.from(vocabSet).sort();
  const index = new Map(vocab.map((s, i) => [s, i]));

  // X, y
  const X = new Array(rows.length);
  const y = new Array(rows.length);
  const classSet = new Set();

  rows.forEach((r, i) => {
    const v = new Float32Array(vocab.length); // binary presence
    symptomCols.forEach(c => {
      const s = r[c];
      if (s && s !== "nan" && index.has(s)) v[index.get(s)] = 1;
    });
    X[i] = v;
    y[i] = r[targetCol];
    classSet.add(r[targetCol]);
  });

  const classes = Array.from(classSet).sort();
  const classIndex = new Map(classes.map((c, i) => [c, i]));

  return { X, y, vocab, classes, classIndex, symptomCols, targetCol };
}

export function splitTrainTest(X, y, classes, classIndex, testSize = 0.2, seed = 42) {
  // stratified split by class
  const byClass = new Map(classes.map(c => [c, []]));
  y.forEach((label, i) => byClass.get(label).push(i));

  const rand = seededRand(seed);
  const trainIdx = [], testIdx = [];
  byClass.forEach(idxList => {
    const shuffled = idxList.slice().sort(() => rand() - 0.5);
    const cut = Math.max(1, Math.round(shuffled.length * testSize));
    testIdx.push(...shuffled.slice(0, cut));
    trainIdx.push(...shuffled.slice(cut));
  });

  return {
    X_train: trainIdx.map(i => X[i]),
    y_train: trainIdx.map(i => y[i]),
    X_test:  testIdx.map(i => X[i]),
    y_test:  testIdx.map(i => y[i]),
  };
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function trainClassProfiles(X_train, y_train, classes) {
  // collapse training samples into one binary "profile" per class (union of symptoms)
  const profiles = new Map(classes.map(c => [c, null]));
  const counts = new Map(classes.map(c => [c, 0]));

  y_train.forEach((label, i) => {
    const prev = profiles.get(label);
    profiles.set(label, prev ? prev.map((v, k) => Math.max(v, X_train[i][k])) : new Float32Array(X_train[i]));
    counts.set(label, counts.get(label) + 1);
  });

  return { profiles, counts };
}

export function predictScores(x, profiles, classes) {
  // score = overlap (dot) between sample vector and each class profile, normalized by profile size
  const scores = classes.map(c => {
    const p = profiles.get(c);
    if (!p) return { c, score: 0 };
    const overlap = dot(x, p);
    const pSize = dot(p, p) || 1;
    return { c, score: overlap / pSize };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

export function evaluate(X_test, y_test, profiles, classes, classIndex) {
  let correct = 0, top3 = 0;
  const K = classes.length;
  // confusion matrix
  const cm = Array.from({ length: K }, () => Array(K).fill(0));

  const confidences = []; // highest score per sample
  const correctness = []; // 1/0 for calibration

  X_test.forEach((x, i) => {
    const scores = predictScores(x, profiles, classes);
    const pred = scores[0].c;
    const truth = y_test[i];

    confidences.push(scores[0].score);
    correctness.push(pred === truth ? 1 : 0);

    if (pred === truth) correct++;
    const top3set = new Set(scores.slice(0, 3).map(s => s.c));
    if (top3set.has(truth)) top3++;

    cm[classIndex.get(truth)][classIndex.get(pred)]++;
  });

  const accuracy = correct / X_test.length;
  const top3Recall = top3 / X_test.length;

  // per-class precision/recall/F1
  const perClass = classes.map((c, i) => {
    const tp = cm[i][i];
    const fn = cm[i].reduce((a, b, j) => a + (j === i ? 0 : b), 0);
    const fp = cm.reduce((a, row, r) => a + (r === i ? 0 : row[i]), 0);
    const tn = X_test.length - tp - fn - fp;
    const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
    const rec  = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1   = (prec + rec) === 0 ? 0 : (2 * prec * rec) / (prec + rec);
    const support = cm[i].reduce((a, b) => a + b, 0);
    return { class: c, precision: prec, recall: rec, f1, support };
  });

  const f1Macro = perClass.reduce((a, r) => a + r.f1, 0) / perClass.length;

  // calibration (10 bins)
  const bins = 10;
  const counts = Array(bins).fill(0);
  const sumPos = Array(bins).fill(0);
  const sumProb = Array(bins).fill(0);

  confidences.forEach((p, i) => {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(p * bins)));
    counts[b]++;
    sumPos[b] += correctness[i];
    sumProb[b] += p;
  });

  const calib = [];
  for (let b = 0; b < bins; b++) {
    if (counts[b] === 0) continue;
    calib.push({
      binMid: (b + 0.5) / bins,
      meanPred: sumProb[b] / counts[b],
      fracPos: sumPos[b] / counts[b],
      n: counts[b],
    });
  }

  return { accuracy, top3Recall, cm, perClass, f1Macro, calib };
}
