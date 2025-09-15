import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    category: "music",
    tags: "",
    privacy: "private",
<<<<<<< HEAD
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
=======
    thumbnail: "",
  });
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

<<<<<<< HEAD
  const handleThumbnailChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleMediaFilesChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `${API_BASE}/api/creator/portfolio/${editingId}`
      : `${API_BASE}/api/creator/portfolio`;
    const method = editingId ? "PUT" : "POST";

    try {
<<<<<<< HEAD
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

=======
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(form),
      });
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
      if (res.ok) {
        setForm({
          title: "",
          description: "",
          link: "",
          category: "music",
          tags: "",
          privacy: "private",
<<<<<<< HEAD
        });
        setThumbnailFile(null);
        setMediaFiles([]);
        setEditingId(null);
        fetchPortfolios();
      } else {
        const errorData = await res.json();
        alert(`Failed to save portfolio item: ${errorData.message || 'Unknown error'}`);
=======
          thumbnail: "",
        });
        setEditingId(null);
        fetchPortfolios();
      } else {
        alert("Failed to save portfolio item");
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
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
      thumbnail: item.thumbnail || "",
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
          </div>

          <div className="mb-4">
<<<<<<< HEAD
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
=======
            <label className="block mb-1">Thumbnail URL (optional)</label>
            <input
              type="url"
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="https://example.com/image.jpg"
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
            />
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
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
                  thumbnail: "",
                });
                setEditingId(null);
              }}
              className="ml-4 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((item) => (
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
      </div>
    </div>
  );
}
