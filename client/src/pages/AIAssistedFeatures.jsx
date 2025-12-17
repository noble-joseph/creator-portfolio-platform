import React, { useMemo, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AudioPlayer from "../components/AudioPlayer";

// Utility: tokenize simple text
const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","in","on","at","to","for","of","with","is","it","this","that","as","by","from","be"
]);
const tokenize = (text) => (text || "")
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .split(/\s+/)
  .filter(t => t && !STOPWORDS.has(t));

// 1) KNN (TF-IDF cosine similarity) demo with precomputed corpus
function buildTf(tokens) {
  const tf = new Map();
  tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
  const denom = Math.max(tokens.length, 1);
  for (const [k, v] of tf) tf.set(k, v / denom);
  return tf;
}

// NB training and prediction (data-driven)
function trainNaiveBayes(samples) {
  // samples: [{ text, label }]
  const counts = {}; // label -> term -> count
  const labelCounts = {}; // label -> count
  const vocab = new Set();
  samples.forEach(({ text, label }) => {
    const toks = tokenize(text);
    labelCounts[label] = (labelCounts[label] || 0) + 1;
    if (!counts[label]) counts[label] = {};
    const bucket = counts[label];
    toks.forEach(t => { bucket[t] = (bucket[t] || 0) + 1; vocab.add(t); });
  });
  const total = samples.length || 1;
  const priors = Object.fromEntries(Object.entries(labelCounts).map(([lab, c]) => [lab, c / total]));
  return { counts, priors, vocabSize: vocab.size };
}
function predictNaiveBayes(text, model) {
  const { counts, priors, vocabSize } = model || {};
  if (!counts || !priors) return null;
  const toks = tokenize(text);
  let bestLabel = null, bestScore = -Infinity;
  // Support both Map and plain object models
  const labelEntries = typeof counts.entries === 'function' ? counts.entries() : Object.entries(counts);
  for (const entry of labelEntries) {
    const label = Array.isArray(entry) ? entry[0] : entry[0];
    const termCountsRaw = Array.isArray(entry) ? entry[1] : entry[1];
    const termCountsIsMap = termCountsRaw && typeof termCountsRaw.get === 'function';
    const priorVal = (priors && typeof priors.get === 'function') ? priors.get(label) : priors[label];
    const prior = Math.log(priorVal || 1e-9);
    const denom = termCountsIsMap
      ? Array.from(termCountsRaw.values()).reduce((s,v)=>s+v,0) + (vocabSize||0)
      : Object.values(termCountsRaw || {}).reduce((s,v)=>s+v,0) + (vocabSize||0);
    let score = prior;
    toks.forEach(t => {
      const num = termCountsIsMap ? ((termCountsRaw.get(t) || 0) + 1) : (((termCountsRaw || {})[t] || 0) + 1);
      score += Math.log(num/Math.max(denom,1));
    });
    if (score > bestScore) { bestScore = score; bestLabel = label; }
  }
  return bestLabel;
}

// Logistic regression trainer for linear models
function sigmoid(z){ return 1/(1+Math.exp(-z)); }
function trainLogReg(X, y, epochs=80, lr=0.2) {
  if (!X.length) return { w: [], b: 0 };
  const n = X.length, d = X[0].length;
  let w = new Array(d).fill(0), b = 0;
  for (let e=0;e<epochs;e++) {
    let gw = new Array(d).fill(0), gb = 0;
    for (let i=0;i<n;i++) {
      const z = X[i].reduce((s,v,j)=>s+v*w[j], b);
      const p = sigmoid(z);
      const err = p - y[i];
      for (let j=0;j<d;j++) gw[j] += err * X[i][j];
      gb += err;
    }
    for (let j=0;j<d;j++) w[j] -= (lr/n) * gw[j];
    b -= (lr/n) * gb;
    lr *= 0.98; // gentle decay
  }
  return { w, b };
}
function predictLogReg(x, model){ if (!model) return null; const z = x.reduce((s,v,i)=>s+v*(model.w[i]||0), model.b||0); return sigmoid(z); }

// Feature extraction for message quality (vector form)
function qualityFeatures(text){
  const raw = (text || "").slice(0, 500);
  const toks = tokenize(raw);
  const len = raw.length;
  const words = toks.length;
  const unique = new Set(toks).size;
  const upperRatio = (raw.replace(/[^A-Z]/g, "").length) / Math.max(len, 1);
  const linkCount = (raw.match(/https?:\/\//g) || []).length;
  const punctuationBursts = (raw.match(/[!?.]{3,}/g) || []).length;
  const hasGreeting = /(hello|hi|hey|dear)\b/i.test(raw) ? 1 : 0;
  const hasThanks = /(thanks|thank you|appreciate)\b/i.test(raw) ? 1 : 0;
  const asksQuestion = /\?/.test(raw) ? 1 : 0;
  const f_len = words>0 ? Math.max(0, 1 - Math.abs(words - 25) / 25) : 0;
  const f_unique = words>0 ? (unique / words) : 0;
  const f_upper = -upperRatio;
  const f_links = -Math.min(linkCount, 2) * 0.6;
  const f_punct = -Math.min(punctuationBursts, 3) * 0.4;
  const f_greet = hasGreeting ? 0.2 : 0.0;
  const f_thanks = hasThanks ? 0.2 : 0.0;
  const f_question = asksQuestion ? 0.2 : 0.0;
  return [f_len, f_unique, f_upper, f_links, f_punct, f_greet, f_thanks, f_question];
}
function knnSimilarTFIDF(items, query, k = 3, idfMap) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qTf = buildTf(qTokens);
  const qVec = new Map();
  for (const [term, tf] of qTf) {
    const idf = idfMap.get(term) || 0;
    if (idf > 0) qVec.set(term, tf * idf);
  }
  const dot = (a, b) => {
    let s = 0;
    for (const [term, v] of a) s += v * (b.get(term) || 0);
    return s;
  };
  const norm = (a) => Math.sqrt(Array.from(a.values()).reduce((s, v) => s + v * v, 0)) || 1;
  const qn = norm(qVec);
  return items
    .map(it => {
      const v = it.__tfidfVec || new Map();
      const score = dot(qVec, v) / (qn * norm(v));
      return { item: it, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// 2) Naive Bayes (keyword priors) with Laplace smoothing and low-evidence fallback
function naiveBayesCategory(text) {
  const keywords = {
    music: ["song","track","album","guitar","beat","mix","vocal","music","audio"],
    photography: ["photo","shoot","camera","lens","portrait","wedding","light"],
    videography: ["video","film","clip","edit","cinema","footage"],
    design: ["design","ui","ux","logo","brand","poster","figma"],
    writing: ["write","poem","article","blog","story","script"],
    other: []
  };
  const toks = tokenize(text);
  if (toks.length === 0) return "other";
  const alpha = 1;
  const scores = {};
  const totalVocab = new Set(Object.values(keywords).flat()).size || 1;
  for (const cat of Object.keys(keywords)) scores[cat] = 0;
  toks.forEach(t => {
    for (const [cat, list] of Object.entries(keywords)) {
      const count = list.includes(t) ? 1 : 0;
      const prob = (count + alpha) / (list.length + alpha * totalVocab);
      scores[cat] += Math.log(prob);
    }
  });
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const [bestCat, bestScore] = sorted[0];
  const secondScore = sorted[1] ? sorted[1][1] : -Infinity;
  if (bestScore - secondScore < Math.log(1.2)) return "other";
  return bestCat;
}

// 3) Decision Tree demo for privacy recommendation
function privacyDecisionTree({ hasThumbnail, hasTags, hasMedia, hasLink }) {
  // Simple, interpretable rules
  if (!hasMedia && !hasThumbnail) return { recommendation: "private", reason: "No media & no thumbnail" };
  if (hasMedia && hasTags) return { recommendation: "public", reason: "Has media and tags" };
  if (hasMedia && hasLink) return { recommendation: "public", reason: "Has media and external link" };
  return { recommendation: "private", reason: "Insufficient context" };
}

// 4) SVM-like linear scorer: Message Quality (efficient numeric features)
function svmMessageQuality(text) {
  const raw = (text || "").slice(0, 500);
  const toks = tokenize(raw);
  const len = raw.length;
  const words = toks.length;
  if (words === 0) return 0.0;
  const unique = new Set(toks).size;
  const upperRatio = (raw.replace(/[^A-Z]/g, "").length) / Math.max(len, 1);
  const linkCount = (raw.match(/https?:\/\//g) || []).length;
  const punctuationBursts = (raw.match(/[!?.]{3,}/g) || []).length;
  const hasGreeting = /(hello|hi|hey|dear)\b/i.test(raw) ? 1 : 0;
  const hasThanks = /(thanks|thank you|appreciate)\b/i.test(raw) ? 1 : 0;
  const asksQuestion = /\?/.test(raw) ? 1 : 0;
  // Features
  const f_len = Math.max(0, 1 - Math.abs(words - 25) / 25); // peak around ~25 words
  const f_unique = unique / words; // 0-1
  const f_upper = -upperRatio; // penalty
  const f_links = -Math.min(linkCount, 2) * 0.6; // penalty
  const f_punct = -Math.min(punctuationBursts, 3) * 0.4; // penalty
  const f_greet = hasGreeting ? 0.2 : 0.0;
  const f_thanks = hasThanks ? 0.2 : 0.0;
  const f_question = asksQuestion ? 0.2 : 0.0;
  // Linear score (SVM-style), then sigmoid to [0,1]
  const z = 1.2 * f_len + 1.0 * f_unique + 0.8 * f_greet + 0.7 * f_thanks + 0.6 * f_question + 0.8 * f_upper + 1.0 * f_links + 0.8 * f_punct + 0.0;
  return 1 / (1 + Math.exp(-z));
}

// 5) Backprop NN mock: single-layer regression with normalized features
function nnPredictRating(features, W = [0.5, 0.5, 0.5], b = 0.0) {
  const clamped = features.map(v => Math.max(0, Math.min(1, v)));
  const dot = clamped.reduce((s, v, i) => s + v * (W[i] || 0), b);
  return 1 / (1 + Math.exp(-dot));
}

// Decision Tree (trainable) for privacy
function entropy(pos, neg){ const n=pos+neg; if(n===0) return 0; const p=pos/n, q=neg/n; const H=(p? -p*Math.log2(p):0)+(q? -q*Math.log2(q):0); return H; }
function bestSplit(samples, features){
  let best = null;
  for (const f of features){
    const values = samples.map(s=>s[f]).filter(v=>v!==undefined);
    const isNum = typeof values.find(v=>v!==null) === 'number';
    const candidates = isNum ? Array.from(new Set(values)).sort((a,b)=>a-b) : [true,false];
    for (const thr of candidates){
      const left = [], right = [];
      for (const s of samples){
        const v = s[f];
        const goLeft = isNum ? (v<=thr) : Boolean(v)===true;
        (goLeft?left:right).push(s);
      }
      const lp = left.filter(s=>s.label==='public').length, ln = left.length - lp;
      const rp = right.filter(s=>s.label==='public').length, rn = right.length - rp;
      const H = entropy(lp+rp, ln+rn);
      const gain = H - (left.length/(samples.length||1))*entropy(lp,ln) - (right.length/(samples.length||1))*entropy(rp,rn);
      if (!best || gain > best.gain){ best = { feature: f, threshold: isNum?thr:true, isNum, gain, left, right }; }
    }
  }
  return best;
}
function trainDecisionTree(samples, features, depth=0, maxDepth=3, minSamples=5){
  const pub = samples.filter(s=>s.label==='public').length;
  const priv = samples.length - pub;
  if (depth>=maxDepth || samples.length<=minSamples || pub===0 || priv===0){
    return { type:'leaf', label: pub>=priv?'public':'private' };
  }
  const split = bestSplit(samples, features);
  if (!split || split.left.length===0 || split.right.length===0){
    return { type:'leaf', label: pub>=priv?'public':'private' };
  }
  return {
    type:'node',
    feature: split.feature,
    threshold: split.isNum? split.threshold : true,
    isNum: split.isNum,
    left: trainDecisionTree(split.left, features, depth+1, maxDepth, minSamples),
    right: trainDecisionTree(split.right, features, depth+1, maxDepth, minSamples)
  };
}
function predictDecisionTree(x, node){
  if (!node) return null;
  if (node.type==='leaf') return node.label;
  const v = x[node.feature];
  const goLeft = node.isNum ? (Number(v)<=Number(node.threshold)) : Boolean(v)===true;
  return predictDecisionTree(x, goLeft?node.left:node.right);
}

export default function AIAssistedFeatures() {
  const [text, setText] = useState("");
  const [items] = useState([
    { id: 1, title: "Ambient guitar track", description: "Dreamy reverb guitars", tags: ["music","guitar","ambient"] },
    { id: 2, title: "Portrait photo session", description: "Studio portrait lighting", tags: ["photography","portrait"] },
    { id: 3, title: "Logo design concept", description: "Brand identity exploration", tags: ["design","branding"] },
  ]);
  const [knnItems, setKnnItems] = useState(items);
  const [nbModel, setNbModel] = useState(null);
  const [svmModel, setSvmModel] = useState(null);
  const [nnModel, setNnModel] = useState(null);
  const [dtModel, setDtModel] = useState(null);
  const [useLearnedDT, setUseLearnedDT] = useState(true);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [debouncedText, setDebouncedText] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedText(text), 200);
    return () => clearTimeout(id);
  }, [text]);

  // Load models from localStorage (component scope)
  useEffect(() => {
    try {
      const nb = localStorage.getItem('nbModel');
      const svm = localStorage.getItem('svmModel');
      const nnm = localStorage.getItem('nnModel');
      const kitems = localStorage.getItem('knnItems');
      const dtm = localStorage.getItem('dtModel');
      if (nb) setNbModel(JSON.parse(nb));
      if (svm) setSvmModel(JSON.parse(svm));
      if (nnm) setNnModel(JSON.parse(nnm));
      if (kitems) setKnnItems(JSON.parse(kitems));
      if (dtm) setDtModel(JSON.parse(dtm));
    } catch {}
  }, []);

  // Dataset upload/train handlers (component scope)
  const handleDatasetUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const textContent = await file.text();
    try {
      const data = JSON.parse(textContent);
      setDatasetInfo(data);
      if (Array.isArray(data.nb_samples)) {
        const nb = trainNaiveBayes(data.nb_samples.map(s=>({ text: s.text || '', label: s.label || 'other' })));
        setNbModel(nb);
        localStorage.setItem('nbModel', JSON.stringify(nb));
      }
      if (Array.isArray(data.svm_quality_samples)) {
        const X = data.svm_quality_samples.map(s=> qualityFeatures(s.text || ''));
        const y = data.svm_quality_samples.map(s=> Number(Boolean(s.label)));
        const model = trainLogReg(X, y, 120, 0.25);
        setSvmModel(model);
        localStorage.setItem('svmModel', JSON.stringify(model));
      }
      if (Array.isArray(data.nn_engagement_samples)) {
        const X = data.nn_engagement_samples.map(s=> [
          Math.max(0, Math.min(1, (s.plays||0)/100)),
          Math.max(0, Math.min(1, (s.likes||0)/10)),
          Math.max(0, Math.min(1, (s.comments||0)/10)),
        ]);
        const y = data.nn_engagement_samples.map(s=> Number(Boolean(s.label)));
        const model = trainLogReg(X, y, 120, 0.25);
        setNnModel(model);
        localStorage.setItem('nnModel', JSON.stringify(model));
      }
      if (Array.isArray(data.knn_items)) {
        setKnnItems(data.knn_items);
        localStorage.setItem('knnItems', JSON.stringify(data.knn_items));
      }
    } catch(err) {
      console.error('Invalid dataset JSON', err);
      alert('Invalid dataset JSON');
    }
  };

  const handleClearModels = () => {
    setNbModel(null);
    setSvmModel(null);
    setNnModel(null);
    setDtModel(null);
    setKnnItems(items);
    setDatasetInfo(null);
    localStorage.removeItem('nbModel');
    localStorage.removeItem('svmModel');
    localStorage.removeItem('nnModel');
    localStorage.removeItem('dtModel');
    localStorage.removeItem('knnItems');
  };

  const { idfMap, enrichedItems } = useMemo(() => {
    const docs = knnItems.map(it => tokenize(`${it.title} ${it.description} ${it.tags?.join(" ")}`));
    const df = new Map();
    docs.forEach(tokens => {
      const seen = new Set(tokens);
      for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
    });
    const N = Math.max(docs.length, 1);
    const idf = new Map();
    for (const [t, c] of df) idf.set(t, Math.log((N + 1) / (c + 1)) + 1);
    const enriched = knnItems.map((it, i) => {
      const tf = buildTf(docs[i]);
      const vec = new Map();
      for (const [term, tfv] of tf) vec.set(term, tfv * (idf.get(term) || 0));
      return { ...it, __tfidfVec: vec };
    });
    return { idfMap: idf, enrichedItems: enriched };
  }, [knnItems]);

  const knn = useMemo(() => knnSimilarTFIDF(enrichedItems, debouncedText || "guitar ambient music", 3, idfMap), [enrichedItems, debouncedText, idfMap]);
  const nbCat = useMemo(() => {
    const input = text || "ambient guitar track";
    if (nbModel) {
      const pred = predictNaiveBayes(input, nbModel);
      return pred || naiveBayesCategory(input);
    }
    return naiveBayesCategory(input);
  }, [text, nbModel]);

  const [privacyProbe, setPrivacyProbe] = useState({
    hasThumbnail: true,
    hasTags: true,
    hasMedia: true,
    hasLink: false,
  });
  const privacy = privacyDecisionTree(privacyProbe);
  const learnedPrivacy = useMemo(() => {
    if (!dtModel) return null;
    const pred = predictDecisionTree(privacyProbe, dtModel);
    return pred ? { recommendation: pred, reason: 'Learned Decision Tree' } : null;
  }, [privacyProbe, dtModel]);

  const [msg, setMsg] = useState("Hey! Loved your latest track — would you be open to collaborating on a chill ambient piece?");
  const [debouncedMsg, setDebouncedMsg] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedMsg(msg), 150);
    return () => clearTimeout(id);
  }, [msg]);
  const quality = useMemo(() => {
    if (svmModel) {
      const x = qualityFeatures(debouncedMsg);
      const p = predictLogReg(x, svmModel);
      return p ?? svmMessageQuality(debouncedMsg);
    }
    return svmMessageQuality(debouncedMsg);
  }, [debouncedMsg, svmModel]);

  const [feat, setFeat] = useState({ plays: 10, likes: 2, comments: 1 });
  const nn = useMemo(() => {
    const f = [feat.plays/100, feat.likes/10, feat.comments/10].map(v => Math.max(0, Math.min(1, v)));
    if (nnModel) {
      const p = predictLogReg(f, nnModel);
      return p ?? nnPredictRating(f);
    }
    return nnPredictRating(f);
  }, [feat, nnModel]);

  const [evalRunning, setEvalRunning] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 1200);
  };

  const computeMetrics = (yTrue, yPred) => {
    let tp=0, fp=0, tn=0, fn=0;
    for (let i=0;i<yTrue.length;i++) {
      const t = yTrue[i] ? 1 : 0;
      const p = yPred[i] ? 1 : 0;
      if (t===1 && p===1) tp++; else if (t===0 && p===1) fp++; else if (t===0 && p===0) tn++; else fn++;
    }
    const acc = (tp+tn)/Math.max(yTrue.length,1);
    const prec = tp/Math.max(tp+fp,1e-9);
    const rec = tp/Math.max(tp+fn,1e-9);
    const f1 = (2*prec*rec)/Math.max(prec+rec,1e-9);
    return { accuracy: acc, precision: prec, recall: rec, f1 };
  };

  const runEvaluation = () => {
    setEvalRunning(true);
    setTimeout(() => {
      const nbData = [
        { x: "ambient guitar track with lush reverb", y: "music" },
        { x: "studio portrait with soft lighting", y: "photography" },
        { x: "short film editing and color grading", y: "videography" },
        { x: "minimalist logo design in figma", y: "design" },
        { x: "writing a heartfelt poem", y: "writing" },
      ];
      const nbYTrue = nbData.map(d=>d.y);
      const nbYPred = nbData.map(d=> nbModel ? (predictNaiveBayes(d.x, nbModel) || naiveBayesCategory(d.x)) : naiveBayesCategory(d.x));
      const nbAcc = nbYTrue.filter((v,i)=>v===nbYPred[i]).length/nbYTrue.length;

      const dtData = [
        { x: { hasThumbnail:false, hasTags:false, hasMedia:false, hasLink:false }, y: "private" },
        { x: { hasThumbnail:true, hasTags:true, hasMedia:true, hasLink:false }, y: "public" },
        { x: { hasThumbnail:true, hasTags:false, hasMedia:true, hasLink:true }, y: "public" },
        { x: { hasThumbnail:true, hasTags:false, hasMedia:false, hasLink:true }, y: "private" },
      ];
      const dtYTrue = dtData.map(d=>d.y);
      const dtYPred = dtData.map(d=> (dtModel && useLearnedDT) ? predictDecisionTree(d.x, dtModel) : privacyDecisionTree(d.x).recommendation);
      const dtAcc = dtYTrue.filter((v,i)=>v===dtYPred[i]).length/dtYTrue.length;

      const svmData = [
        { x: "Hello! Loved your work, can we collaborate next month?", y: 1 },
        { x: "FREE CLICK NOW LIMITED OFFER!!!", y: 0 },
        { x: "Hey, quick question about your rates? Thanks!", y: 1 },
        { x: "Buy followers at http://spam.example now", y: 0 },
      ];
      const svmYTrue = svmData.map(d=>d.y);
      const svmScores = svmData.map(d=> svmModel ? predictLogReg(qualityFeatures(d.x), svmModel) : svmMessageQuality(d.x));
      const svmPred = svmScores.map(s=> s>=0.6 ? 1 : 0);
      const svmM = computeMetrics(svmYTrue, svmPred);

      const nnData = [
        { x: { plays:500, likes:30, comments:20 }, y: 1 },
        { x: { plays:20, likes:1, comments:0 }, y: 0 },
        { x: { plays:200, likes:10, comments:5 }, y: 1 },
        { x: { plays:50, likes:2, comments:1 }, y: 0 },
      ];
      const nnYTrue = nnData.map(d=>d.y);
      const nnScores = nnData.map(d=> {
        const f = [d.x.plays/100, d.x.likes/10, d.x.comments/10].map(v=>Math.max(0, Math.min(1, v)));
        return nnModel ? predictLogReg(f, nnModel) : nnPredictRating(f);
      });
      const nnPred = nnScores.map(s=> s>=0.6 ? 1 : 0);
      const nnM = computeMetrics(nnYTrue, nnPred);

      const knnCorpus = (datasetInfo?.knn_items?.length ? datasetInfo.knn_items : [
        { id: 101, title: "Lo-fi beat", description: "chillhop study", tags:["music","beat"] },
        { id: 102, title: "Wedding portrait", description: "golden hour", tags:["photography","portrait"] },
        { id: 103, title: "UI logo set", description: "brand marks", tags:["design","logo"] },
        { id: 104, title: "Short film edit", description: "cinematic", tags:["videography","edit"] },
      ]);
      const { idfMap: kmIdf, enrichedItems: kItems } = (() => {
        const docs = knnCorpus.map(it => tokenize(`${it.title} ${it.description} ${it.tags?.join(" ")}`));
        const df = new Map();
        docs.forEach(tokens => { const seen = new Set(tokens); for (const t of seen) df.set(t, (df.get(t)||0)+1); });
        const N = Math.max(docs.length,1);
        const idf = new Map(); for (const [t,c] of df) idf.set(t, Math.log((N+1)/(c+1))+1);
        const enriched = knnCorpus.map((it, i) => {
          const tf = buildTf(docs[i]);
          const vec = new Map(); for (const [term, tfv] of tf) vec.set(term, tfv * (idf.get(term)||0));
          return { ...it, __tfidfVec: vec };
        });
        return { idfMap: idf, enrichedItems: enriched };
      })();
      const knnQueries = [
        { q: "chill lo fi music beat", rel: [101] },
        { q: "golden hour portrait photo", rel: [102] },
        { q: "brand logo design", rel: [103] },
        { q: "cinematic film editing", rel: [104] },
      ];
      const k = 3;
      let correct1 = 0, total = knnQueries.length;
      let pSum = 0, rSum = 0, fSum = 0;
      knnQueries.forEach(example => {
        const res = knnSimilarTFIDF(kItems, example.q, k, kmIdf);
        const retrieved = res.map(x=>x.item.id);
        const rel = new Set(example.rel);
        if (retrieved[0] && rel.has(retrieved[0])) correct1++;
        const hits = retrieved.filter(id=>rel.has(id)).length;
        const precision = hits/Math.max(retrieved.length,1);
        const recall = hits/Math.max(rel.size,1);
        const f1 = (2*precision*recall)/Math.max(precision+recall,1e-9);
        pSum += precision; rSum += recall; fSum += f1;
      });
      const knnMetrics = {
        accuracyTop1: correct1/Math.max(total,1),
        precisionAtK: pSum/Math.max(total,1),
        recallAtK: rSum/Math.max(total,1),
        f1AtK: fSum/Math.max(total,1),
      };

      setEvalResult({
        nb: { accuracy: nbAcc },
        dt: { accuracy: dtAcc },
        svm: svmM,
        nn: nnM,
        knn: knnMetrics,
      });
      setEvalRunning(false);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8 space-y-10">
        <h1 className="text-3xl font-bold">AI-Assisted Features</h1>
        <p className="text-gray-300">Each section shows the algorithm used.</p>
        <div className="flex items-center gap-3">
          <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">Submit</button>
          {submitted && <span className="text-green-400 text-sm">Submitted</span>}
          <button onClick={runEvaluation} disabled={evalRunning} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded">{evalRunning ? 'Evaluating...' : 'Run Evaluation'}</button>
        </div>
        <section className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-purple-300 mb-2">Dataset & Training</div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input type="file" accept="application/json" onChange={handleDatasetUpload} className="text-sm" />
            <button onClick={handleClearModels} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">Clear Models</button>
            {datasetInfo && <span className="text-gray-300 text-sm">Loaded sections: {Object.keys(datasetInfo).join(', ')}</span>}
            {(nbModel || svmModel || nnModel) && <span className="text-green-400 text-sm">Trained models active</span>}
          </div>
        </section>

        {/* KNN */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-purple-300 mb-2">Algorithm: K-Nearest Neighbors (KNN)</div>
          <h2 className="text-xl font-semibold mb-3">Similar Items</h2>
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Describe what you like (e.g., ambient guitar)"
            className="w-full p-2 rounded bg-gray-700 mb-3"
          />
          <ul className="list-disc list-inside text-gray-200">
            {knn.map(({item, score}) => (
              <li key={item.id}>{item.title} <span className="text-xs text-gray-400">(score {score.toFixed(2)})</span></li>
            ))}
          </ul>
        </section>

        {/* Naive Bayes */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-purple-300 mb-2">Algorithm: Bayesian Classifier (Naive Bayes)</div>
          <h2 className="text-xl font-semibold mb-3">Category Suggestion</h2>
          <p className="text-gray-300 mb-2">Type title/description; it suggests a category.</p>
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="e.g., Mixing a vocal track with guitars"
            className="w-full p-2 rounded bg-gray-700 mb-2"
          />
          <div className="text-green-300">Suggested category: <b className="capitalize">{nbCat}</b></div>
        </section>

        {/* Decision Tree */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-purple-300 mb-2">Algorithm: Decision Tree {useLearnedDT && learnedPrivacy ? '(learned)' : '(rule-based)'}</div>
          <h2 className="text-xl font-semibold mb-3">Privacy Recommendation</h2>
          <div className="flex items-center gap-3 mb-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useLearnedDT} onChange={()=>setUseLearnedDT(v=>!v)} /> Use learned model when available
            </label>
            {dtModel && <span className="text-green-400">Model loaded</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {Object.keys(privacyProbe).map(key => (
              <label key={key} className="flex items-center space-x-2">
                <input type="checkbox" checked={privacyProbe[key]} onChange={()=>setPrivacyProbe(p=>({...p, [key]: !p[key]}))} />
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
          <div className="text-blue-300">Recommendation: <b>{(useLearnedDT && learnedPrivacy ? learnedPrivacy.recommendation : privacy.recommendation)}</b></div>
          <div className="text-gray-300 text-sm">Reason: {(useLearnedDT && learnedPrivacy ? learnedPrivacy.reason : privacy.reason)}</div>
        </section>

        {/* SVM */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-purple-300 mb-2">Algorithm: Support Vector Machine (linear)</div>
          <h2 className="text-xl font-semibold mb-3">Message Quality</h2>
          <input
            value={msg}
            onChange={(e)=>setMsg(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 mb-2"
          />
          <div className="text-gray-200">Quality: <b>{quality.toFixed(2)}</b> {quality < 0.3 ? <span className="text-red-400">(revise)</span> : quality < 0.6 ? <span className="text-yellow-400">(okay)</span> : <span className="text-green-400">(great)</span>}</div>
        </section>

        {/* Backprop NN */}
        <section className="bg-gray-800 p-6 rounded-lg">
          <div className="text-sm text-purple-300 mb-2">Algorithm: Backpropagation Neural Network (single-layer demo)</div>
          <h2 className="text-xl font-semibold mb-3">Engagement Rating Prediction</h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <label className="text-sm">Plays
              <input type="number" value={feat.plays} onChange={(e)=>setFeat({...feat, plays: Number(e.target.value)})} className="w-full p-2 rounded bg-gray-700" />
            </label>
            <label className="text-sm">Likes
              <input type="number" value={feat.likes} onChange={(e)=>setFeat({...feat, likes: Number(e.target.value)})} className="w-full p-2 rounded bg-gray-700" />
            </label>
            <label className="text-sm">Comments
              <input type="number" value={feat.comments} onChange={(e)=>setFeat({...feat, comments: Number(e.target.value)})} className="w-full p-2 rounded bg-gray-700" />
            </label>
          </div>
          <div className="text-gray-200">Predicted rating (0-1): <b>{nn.toFixed(2)}</b></div>
        </section>

        {evalResult && (
          <section className="bg-gray-800 p-6 rounded-lg">
            <div className="text-sm text-purple-300 mb-2">Model Evaluation</div>
            <h2 className="text-xl font-semibold mb-4">Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
              <div className="p-4 bg-gray-700/50 rounded">
                <div className="font-semibold mb-1">Naive Bayes (category)</div>
                <div>Accuracy: {(evalResult.nb.accuracy*100).toFixed(0)}%</div>
                <div className="h-2 bg-gray-600 rounded mt-2"><div className="h-2 bg-green-500 rounded" style={{width: `${evalResult.nb.accuracy*100}%`}}/></div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded">
                <div className="font-semibold mb-1">Decision Tree (privacy)</div>
                <div>Accuracy: {(evalResult.dt.accuracy*100).toFixed(0)}%</div>
                <div className="h-2 bg-gray-600 rounded mt-2"><div className="h-2 bg-green-500 rounded" style={{width: `${evalResult.dt.accuracy*100}%`}}/></div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded">
                <div className="font-semibold mb-1">SVM (message quality ≥ 0.6)</div>
                <div>Accuracy: {(evalResult.svm.accuracy*100).toFixed(0)}%</div>
                <div>Precision: {(evalResult.svm.precision*100).toFixed(0)}%</div>
                <div>Recall: {(evalResult.svm.recall*100).toFixed(0)}%</div>
                <div>F1-score: {(evalResult.svm.f1*100).toFixed(0)}%</div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded">
                <div className="font-semibold mb-1">Neural Network (≥ 0.6)</div>
                <div>Accuracy: {(evalResult.nn.accuracy*100).toFixed(0)}%</div>
                <div>Precision: {(evalResult.nn.precision*100).toFixed(0)}%</div>
                <div>Recall: {(evalResult.nn.recall*100).toFixed(0)}%</div>
                <div>F1-score: {(evalResult.nn.f1*100).toFixed(0)}%</div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded md:col-span-2">
                <div className="font-semibold mb-1">KNN Retrieval (k=3)</div>
                <div>Top-1 Accuracy: {(evalResult.knn.accuracyTop1*100).toFixed(0)}%</div>
                <div>Precision@3: {(evalResult.knn.precisionAtK*100).toFixed(0)}%</div>
                <div>Recall@3: {(evalResult.knn.recallAtK*100).toFixed(0)}%</div>
                <div>F1@3: {(evalResult.knn.f1AtK*100).toFixed(0)}%</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
