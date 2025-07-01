"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Trash, Plus, Edit } from "lucide-react";

type Slide = {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: File | null | undefined;  // Allow undefined
  imageUrl?: string;
};

export default function SliderSettings() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: null,
    imageUrl: "",
  });

  const addSlide = () => {
    setEditingSlide({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      image: null,
      imageUrl: "",
    });
    setShowForm(true);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const editSlide = (index: number) => {
    setEditingSlide(slides[index]);
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData: { [key: string]: string } = {
      title: editingSlide?.title || "",
      subtitle: editingSlide?.subtitle || "",
      description: editingSlide?.description || "",
      buttonText: editingSlide?.buttonText || "",
      buttonLink: editingSlide?.buttonLink || "",
    };

    if (editingSlide?.image) {
      const form = new FormData();
      form.append("image", editingSlide.image);
      form.append("title", editingSlide.title);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        setErrorMessage("❌ Kļūda augšupielādējot attēlu");
        setLoading(false);
        return;
      }

      const data = await response.json();
      formData.imageUrl = data.imageUrl || "";
    }

    const updatedSlide = {
      ...editingSlide,
      imageUrl: formData.imageUrl || "",
      title: editingSlide?.title || "",
      subtitle: editingSlide?.subtitle || "",
      description: editingSlide?.description || "",
      buttonText: editingSlide?.buttonText || "",
      buttonLink: editingSlide?.buttonLink || "",
      image: editingSlide?.image || null,  // This now handles undefined correctly
    };

    setEditingSlide(updatedSlide);

    const response = await fetch("/api/slides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, id: editingSlide?.id }),
    });

    if (!response.ok) {
      setErrorMessage("Failed to save slide.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/slides");
    const data = await res.json();
    setSlides(data);

    setSuccessMessage("Veiksmīgi izmainīts!");
    setLoading(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete slide");
      }

      setSlides((prevSlides) => prevSlides.filter((slide) => slide.id !== id));
      setSuccessMessage("Slaids veiksmīgi izdzēsts!");
    } catch (error) {
      setErrorMessage("❌ Kļūda dzēšot slaidu");
    }
  };

  const handleFormSubmit = () => {
    handleSave();
  };

  useEffect(() => {
    const fetchSlides = async () => {
      const res = await fetch("/api/slides");
      const data = await res.json();

      if (Array.isArray(data)) {
        setSlides(data);
      } else {
        setSlides([]);
      }
      setLoading(false);
    };

    fetchSlides();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-10">
      <h2 className="text-2xl font-bold text-[#00332D]">Slaidera iestatījumi</h2>
      {successMessage && (
        <div className="bg-green-500 text-white p-4 rounded-md">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500 text-white p-4 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Table to display existing slides */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Virsraksts</th>
              <th className="py-2 px-4 border-b">Apakšvirsraksts</th>
              <th className="py-2 px-4 border-b">Attēls</th>
              <th className="py-2 px-4 border-b">Rīcība</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(slides) && slides.length > 0 ? (
              slides.map((slide, index) => (
                <tr key={slide.id}>
                  <td className="py-2 px-4 border-b">{slide.title}</td>
                  <td className="py-2 px-4 border-b">{slide.subtitle}</td>
                  <td className="py-2 px-4 border-b">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <p>No image</p>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button onClick={() => editSlide(index)} className="text-blue-600">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id!)}
                      className="text-red-600 ml-2"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-2 px-4 text-center">
                  No slides available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit slide form */}
      {showForm && (
        <div className="space-y-6 mt-6 bg-white p-6 border rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[#00332D]">
            {editingSlide?.id ? "Rediģēt slaidu" : "Pievienot jaunu slaidu"}
          </h3>

          <div className="space-y-2">
            <Label>Virsraksts</Label>
            <Input
              value={editingSlide?.title || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide!, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Apakšvirsraksts</Label>
            <Input
              value={editingSlide?.subtitle || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide!, subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Apraksts</Label>
            <Textarea
              rows={3}
              value={editingSlide?.description || ""}
              onChange={(e) => setEditingSlide({ ...editingSlide!, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pogas teksts</Label>
              <Input
                value={editingSlide?.buttonText || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide!, buttonText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pogas saite</Label>
              <Input
                value={editingSlide?.buttonLink || ""}
                onChange={(e) => setEditingSlide({ ...editingSlide!, buttonLink: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attēls</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setEditingSlide({ ...editingSlide!, image: e.target.files?.[0] || null })}
            />
          </div>

          <Button onClick={handleFormSubmit} className="mt-4">
            Saglabāt
          </Button>
        </div>
      )}

      <Button variant="outline" onClick={addSlide}>
        <Plus className="w-4 h-4 mr-1" /> Pievienot slaidu
      </Button>

      <div>
        <Button className="mt-6" onClick={handleSave} disabled={loading}>
          {loading ? "Saglabājas..." : "Saglabāt izmaiņas"}
        </Button>
      </div>
    </div>
  );
}