import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FaSave, FaUpload, FaTrash } from "react-icons/fa";
import BackButton from "./BackButton";

export default function HeroEditor() {
  const [rowId, setRowId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    heading: "",
    subheading: "",
    description: "",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchHero();
  }, []);

  // Fetch latest hero
  async function fetchHero() {
    const { data, error } = await supabase
      .from("hero")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      const hero = data[0];

      setRowId(hero.id);

      setForm({
        heading: hero.heading || "",
        subheading: hero.subheading || "",
        description: hero.description || "",
        image_url: hero.image_url || "",
      });

      setPreview(hero.image_url || "");
    } else {
      setRowId(null);
      setPreview("");
    }
  }

  // Input changes
  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  // Preview uploaded image
  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  // Save Hero
  async function saveHero() {
    setLoading(true);

    try {
      let imageUrl = form.image_url;

      // Upload new image if selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("Nora-ugc-creator")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("Nora-ugc-creator")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const heroData = {
        heading: form.heading,
        subheading: form.subheading,
        description: form.description,
        image_url: imageUrl,
      };

      let error;

      if (rowId) {
        ({ error } = await supabase
          .from("hero")
          .update(heroData)
          .eq("id", rowId));
      } else {
        const { data, error: insertError } = await supabase
          .from("hero")
          .insert([heroData])
          .select();

        error = insertError;

        if (data && data.length > 0) {
          setRowId(data[0].id);
        }
      }

      if (error) throw error;

      alert("Hero updated successfully!");
      fetchHero();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Delete Hero
  async function deleteHero() {
    if (!rowId) {
      alert("No hero content found.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Hero section?"
    );

    if (!confirmDelete) return;

    try {
      // Delete image from Storage
      if (form.image_url) {
        const fileName = form.image_url.split("/").pop();

        await supabase.storage
          .from("Nora-ugc-creator")
          .remove([fileName]);
      }

      // Delete row
      const { error } = await supabase
        .from("hero")
        .delete()
        .eq("id", rowId);

      if (error) throw error;

      alert("Hero deleted successfully!");

      // Reset state
      setRowId(null);
      setPreview("");
      setImageFile(null);

      setForm({
        heading: "",
        subheading: "",
        description: "",
        image_url: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 px-5">
      <div className="max-w-4xl mx-auto">

        <BackButton />

        <p className="uppercase tracking-[5px] text-pink-500 text-xs mb-2">
          Admin Panel
        </p>

        <h1 className="text-4xl font-serif mb-8">
          Hero Editor
        </h1>

        <div className="bg-[#161616] rounded-[30px] border border-pink-500/20 p-6 space-y-6">

          {/* Heading */}
          <div>
            <label className="block text-pink-300 text-sm uppercase tracking-[2px] mb-2">
              Heading
            </label>

            <input
              type="text"
              name="heading"
              value={form.heading}
              onChange={handleChange}
              placeholder="Creating content that sells..."
              className="w-full bg-[#242424] rounded-xl p-4 outline-none border border-transparent focus:border-pink-500"
            />
          </div>

          {/* Subheading */}
          <div>
            <label className="block text-pink-300 text-sm uppercase tracking-[2px] mb-2">
              Sub Heading
            </label>

            <input
              type="text"
              name="subheading"
              value={form.subheading}
              onChange={handleChange}
              placeholder="UGC Creator • Beauty • Lifestyle"
              className="w-full bg-[#242424] rounded-xl p-4 outline-none border border-transparent focus:border-pink-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-pink-300 text-sm uppercase tracking-[2px] mb-2">
              Description
            </label>

            <textarea
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write your hero description..."
              className="w-full bg-[#242424] rounded-xl p-4 outline-none resize-none border border-transparent focus:border-pink-500"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="flex items-center justify-center gap-3 bg-pink-500 hover:bg-pink-400 py-3 rounded-full cursor-pointer font-semibold transition">
              <FaUpload />
              Upload Hero Image

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleImage}
              />
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="Hero Preview"
              className="w-full h-72 object-cover rounded-2xl border border-pink-500/20"
            />
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">

            <button
              onClick={saveHero}
              disabled={loading}
              className="flex-1 bg-pink-500 hover:bg-pink-400 py-4 rounded-full font-semibold flex items-center justify-center gap-3 disabled:opacity-50 transition"
            >
              <FaSave />
              {loading ? "Saving Hero..." : "Save Hero"}
            </button>

            <button
              onClick={deleteHero}
              className="flex-1 bg-red-600 hover:bg-red-500 py-4 rounded-full font-semibold flex items-center justify-center gap-3 transition"
            >
              <FaTrash />
              Delete Hero
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}