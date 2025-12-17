import React, { useState, useEffect, useMemo } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import AudioPlayer from "../components/AudioPlayer";
import { nonEmpty, isURL, maxLen, tagsValid } from "../utils/validation";

// --- AI helpers (simple client-side demos) ---
const STOPWORDS = new Set(["the","a","an","and","or","but","if","in","on","at","to","for","of","with","is","it","this","that","as","by","from","be"]);
const tokenize = (text) => (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(t => t && !STOPWORDS.has(t));

const naiveBayesCategory = (text) => {
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
};

const privacyDecisionTree = ({ hasThumbnail, hasTags, hasMedia, hasLink }) => {
  if (!hasMedia && !hasThumbnail) return { recommendation: "private", reason: "No media & no thumbnail" };
  if (hasMedia && hasTags) return { recommendation: "public", reason: "Has media and tags" };
  if (hasMedia && hasLink) return { recommendation: "public", reason: "Has media and external link" };
  return { recommendation: "private", reason: "Insufficient context" };
};

function buildTf(tokens){
  const tf = new Map();
  tokens.forEach(t=>tf.set(t,(tf.get(t)||0)+1));
  const denom = Math.max(tokens.length,1);
  for (const [k,v] of tf) tf.set(k, v/denom);
  return tf;
}
const knnSimilarTFIDF = (items, query, k = 3, idfMap) => {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qTf = buildTf(qTokens);
  const qVec = new Map();
  for (const [term, tf] of qTf) {
    const idf = idfMap.get(term) || 0;
    if (idf > 0) qVec.set(term, tf * idf);
  }
  const dot = (a,b)=>{ let s=0; for (const [term,v] of a) s += v * (b.get(term)||0); return s; };
  const norm = (a)=> Math.sqrt(Array.from(a.values()).reduce((s,v)=>s+v*v,0)) || 1;
  const qn = norm(qVec);
  return items.map(it=>{
    const v = it.__tfidfVec || new Map();
    return { item: it, score: dot(qVec, v)/(qn*norm(v)) };
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,k);
};

const nnPredict = (views = 0, likes = 0, comments = 0) => {
  // Simple normalized features to [0,1], then sigmoid
  const f = [Math.min(views/1000,1), Math.min(likes/50,1), Math.min(comments/50,1)];
  const W = [0.5, 0.9, 0.4]; const b = 0.0;
  const z = f.reduce((s,v,i)=>s+v*W[i], b);
  return 1/(1+Math.exp(-z));
};

// Small hook for debouncing values (module scope)
function useDebounced(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    category: "music",
    tags: "",
    privacy: "private",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [sortMode, setSortMode] = useState("newest"); // or "ai"
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/creator/portfolio`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data);
      }
    } catch (error) {
      console.error("Failed to fetch portfolios", error);
    } finally {
      setLoading(false);
    }
  };

  // --- AI computed helpers for UI ---
  const nbSuggestedCategory = useMemo(() => naiveBayesCategory(`${form.title} ${form.description}`), [form.title, form.description]);
  const privacyProbe = {
    hasThumbnail: Boolean(thumbnailFile || form.thumbnail),
    hasTags: Boolean(form.tags && form.tags.trim().length > 0),
    hasMedia: mediaFiles.length > 0,
    hasLink: Boolean(form.link && form.link.trim().length > 0),
  };
  const privacyRec = privacyDecisionTree(privacyProbe);

  const sortedPortfolios = useMemo(() => {
    const list = [...portfolios];
    if (sortMode === "ai") {
      return list
        .map(it => ({ it, score: nnPredict(it.views || 0, (it.likes||[]).length || 0, (it.comments||[]).length || 0) }))
        .sort((a,b)=>b.score-a.score)
        .map(x=>x.it);
    }
    return list.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  }, [portfolios, sortMode]);

  // Precompute TF-IDF for portfolios corpus and debounce query
  const { idfMap, enrichedPortfolios } = useMemo(() => {
    const docs = portfolios.map(it => tokenize(`${it.title} ${it.description} ${(it.tags||[]).join(" ")}`));
    const df = new Map();
    docs.forEach(tokens => { const seen = new Set(tokens); for (const t of seen) df.set(t, (df.get(t)||0)+1); });
    const N = Math.max(docs.length, 1);
    const idf = new Map(); for (const [t,c] of df) idf.set(t, Math.log((N+1)/(c+1)) + 1);
    const enriched = portfolios.map((it, i) => {
      const tf = buildTf(docs[i]);
      const vec = new Map(); for (const [term, tfv] of tf) vec.set(term, tfv * (idf.get(term)||0));
      return { ...it, __tfidfVec: vec };
    });
    return { idfMap: idf, enrichedPortfolios: enriched };
  }, [portfolios]);

  const debouncedQuery = useDebounced(`${form.title} ${form.description} ${form.tags}`, 200);
  const knnList = useMemo(() => knnSimilarTFIDF(enrichedPortfolios, debouncedQuery, 3, idfMap), [enrichedPortfolios, debouncedQuery, idfMap]);

  // Live field validation
  const fieldErrors = useMemo(() => {
    const errs = {};
    if (!nonEmpty(form.title)) errs.title = "Title is required";
    if (!nonEmpty(form.description)) errs.description = "Description is required";
    if (!maxLen(form.title, 100)) errs.title = "Max 100 characters";
    if (!maxLen(form.description, 1000)) errs.description = "Max 1000 characters";
    if (!nonEmpty(form.category)) errs.category = "Select a category";
    if (!isURL(form.link)) errs.link = "Enter a valid URL (with or without http)";
    if (!tagsValid(form.tags)) errs.tags = "Up to 10 tags, each ≤ 30 chars";
    return errs;
  }, [form]);

  const formValid = useMemo(() => Object.keys(fieldErrors).length === 0, [fieldErrors]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleMediaFilesChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!formValid) return;
    const url = editingId
      ? `${API_BASE}/api/creator/portfolio/${editingId}`
      : `${API_BASE}/api/creator/portfolio`;
    const method = editingId ? "PUT" : "POST";

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("link", form.link);
      formData.append("category", form.category);
      formData.append("tags", form.tags);
      formData.append("privacy", form.privacy);

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      mediaFiles.forEach((file, index) => {
        formData.append("mediaFiles", file);
      });

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (res.ok) {
        setForm({
          title: "",
          description: "",
          link: "",
          category: "music",
          tags: "",
          privacy: "private",
        });
        setThumbnailFile(null);
        setMediaFiles([]);
        setEditingId(null);
        fetchPortfolios();
      } else {
        const errorData = await res.json();
        alert(`Failed to save portfolio item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving portfolio item", error);
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description,
      link: item.link,
      category: item.category,
      tags: item.tags.join(", "),
      privacy: item.privacy,
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/creator/portfolio/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (res.ok) {
        fetchPortfolios();
      } else {
        alert("Failed to delete portfolio item");
      }
    } catch (error) {
      console.error("Error deleting portfolio item", error);
    }
  };

  if (loading) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

        <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Portfolio Item" : "Add Portfolio Item"}</h2>

          <div className="mb-4">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            {submitAttempted && fieldErrors.title && <p className="mt-1 text-xs text-red-300">{fieldErrors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            {submitAttempted && fieldErrors.description && <p className="mt-1 text-xs text-red-300">{fieldErrors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Link</label>
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="https://example.com"
            />
            {submitAttempted && fieldErrors.link && <p className="mt-1 text-xs text-red-300">{fieldErrors.link}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            >
              <option value="music">Music</option>
              <option value="photography">Photography</option>
              <option value="video">Video</option>
              <option value="artwork">Artwork</option>
              <option value="other">Other</option>
            </select>
            <div className="text-xs text-purple-300 mt-1">Algorithm: Bayesian Classifier (Naive Bayes) — Suggested: <b className="capitalize">{nbSuggestedCategory}</b></div>
            {submitAttempted && fieldErrors.category && <p className="mt-1 text-xs text-red-300">{fieldErrors.category}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="e.g. jazz, live, concert"
            />
            {submitAttempted && fieldErrors.tags && <p className="mt-1 text-xs text-red-300">{fieldErrors.tags}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1">Privacy</label>
            <select
              name="privacy"
              value={form.privacy}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <div className="text-xs text-blue-300 mt-1">Algorithm: Decision Tree — Recommendation: <b>{privacyRec.recommendation}</b> <span className="text-gray-300">(Reason: {privacyRec.reason})</span></div>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Thumbnail (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Media Files (optional)</label>
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              onChange={handleMediaFilesChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={!formValid}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
          >
            {editingId ? "Update" : "Add"} Portfolio Item
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  title: "",
                  description: "",
                  link: "",
                  category: "music",
                  tags: "",
                  privacy: "private",
                });
                setThumbnailFile(null);
                setMediaFiles([]);
                setEditingId(null);
              }}
              className="ml-4 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </form>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Items</h2>
          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-300">Sort:</label>
            <select value={sortMode} onChange={(e)=>setSortMode(e.target.value)} className="p-2 bg-gray-700 rounded text-white">
              <option value="newest">Newest</option>
              <option value="ai">AI score (Neural Network)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPortfolios.map((item) => (
            <div key={item._id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="mb-2">{item.description}</p>
              <p className="mb-2">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
                  View Work
                </a>
              </p>
              <p className="mb-2 text-sm text-gray-400">Category: {item.category}</p>
              <p className="mb-2 text-sm text-gray-400">Tags: {item.tags.join(", ")}</p>
              <p className="mb-2 text-sm text-gray-400">Privacy: {item.privacy}</p>
              <div className="flex space-x-2">
                {item.mediaFiles?.find(m => m.type === 'audio') && (
                  <button
                    onClick={() => {
                      const audioFile = item.mediaFiles.find(m => m.type === 'audio');
                      if (audioFile) {
                        if (playingAudio === item._id) {
                          setPlayingAudio(null);
                        } else {
                          setPlayingAudio(item._id);
                        }
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                  >
                    {playingAudio === item._id ? '⏸️' : '▶️'}
                  </button>
                )}
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Audio Player Modal */}
        {playingAudio && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              {(() => {
                const item = portfolios.find(p => p._id === playingAudio);
                const audioFile = item?.mediaFiles?.find(m => m.type === 'audio');
                return audioFile ? (
                  <AudioPlayer
                    src={audioFile.url.startsWith('http') ? audioFile.url : `${API_BASE}/uploads/${audioFile.url}`}
                    title={item.title}
                    onEnded={() => setPlayingAudio(null)}
                  />
                ) : null;
              })()}
              <button
                onClick={() => setPlayingAudio(null)}
                className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                Close Player
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
