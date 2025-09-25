import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "../state/useAuthStore";
import { api } from "../services/api";

type Artist = { id: number; name: string };
type Track = {
  id: number;
  title: string;
  file?: File;
};

export default function ArtistDashboard() {
  const { user } = useAuthStore();
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);

  const [single, setSingle] = useState<{ title: string; file?: File }>({
    title: "",
  });

  const [album, setAlbum] = useState<{ name: string; cover?: File; tracks: Track[] }>(
    {
      name: "",
      tracks: [],
    }
  );

  // Fetch all artists (kept in case used elsewhere)
  useEffect(() => {
    api
      .get("/api/artists/artists")
      .then((res) => {
        if (Array.isArray(res.data)) setAllArtists(res.data);
        else setAllArtists([]);
      })
      .catch((err) => console.error(err));
  }, []);

  // ---- Helpers ----
  const addAlbumTrack = () => {
    setAlbum((prev) => ({
      ...prev,
      tracks: [...prev.tracks, { id: Date.now(), title: "" }],
    }));
  };

  // ---- Submit handlers ----
  const submitSingle = async () => {
    if (!user) return;

    const form = new FormData();
    form.append("title", single.title);
    if (single.file) form.append("audio", single.file);

    try {
      const token = localStorage.getItem("pulse_token");
      const res = await api.post("/api/artists/singles", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Single submitted:", res.data);
      alert("Single uploaded successfully!");
      setSingle({ title: "" });
      setShowSingleModal(false);
    } catch (err) {
      console.error("Single submit error:", err);
    }
  };

  const submitAlbum = async () => {
    if (!user) return;

    const form = new FormData();
    form.append("title", album.name);
    if (album.cover) form.append("cover", album.cover);

    album.tracks.forEach((t, index) => {
      if (t.file) form.append(`track_${index}`, t.file);
    });

    form.append("tracks", JSON.stringify(
      album.tracks.map((t, index) => ({ title: t.title, fileField: `track_${index}` }))
    ));

    try {
      const res = await api.post("/api/artists/albums", form);
      console.log("Album submitted successfully:", res.data);
      alert("Album uploaded successfully!");
      setShowAlbumModal(false);
      setAlbum({ name: "", tracks: [] });
    } catch (err) {
      console.error("Album submit error:", err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="glass p-8 flex items-center gap-10">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-2xl border border-white/10">
          {user?.display_name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{user?.display_name || user?.username}</h1>
          <p className="text-gray-300">{user?.role}</p>
        </div>
      </header>

      {/* Release Buttons */}
      <div className="flex justify-center gap-6">
        <button onClick={() => setShowSingleModal(true)} className="btn-glass">
          Release New Single
        </button>
        <button onClick={() => setShowAlbumModal(true)} className="btn-glass">
          Release New Album
        </button>
      </div>

      {/* Modals */}
      {showSingleModal && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={() => setShowSingleModal(false)} className="close-btn">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold">Release New Single</h2>

            <input
              type="text"
              placeholder="Single Title"
              value={single.title}
              onChange={(e) => setSingle({ ...single, title: e.target.value })}
              className="input-glass"
            />
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setSingle({ ...single, file: e.target.files?.[0] })}
            />

            <button onClick={submitSingle} className="btn-submit">
              Release Single
            </button>
          </div>
        </div>
      )}

      {showAlbumModal && (
        <div className="modal">
          <div className="modal-content max-w-3xl">
            <button onClick={() => setShowAlbumModal(false)} className="close-btn">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold">Release New Album</h2>

            <input
              type="text"
              placeholder="Album Name"
              value={album.name}
              onChange={(e) => setAlbum({ ...album, name: e.target.value })}
              className="input-glass"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAlbum({ ...album, cover: e.target.files?.[0] })}
            />

            {album.tracks.map((t) => (
              <div key={t.id} className="glass p-3 space-y-2">
                <input
                  type="text"
                  placeholder={`Track ${t.id} Title`}
                  value={t.title}
                  onChange={(e) =>
                    setAlbum((prev) => ({
                      ...prev,
                      tracks: prev.tracks.map((x) =>
                        x.id === t.id ? { ...x, title: e.target.value } : x
                      ),
                    }))
                  }
                  className="input-glass"
                />
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setAlbum((prev) => ({
                      ...prev,
                      tracks: prev.tracks.map((x) =>
                        x.id === t.id ? { ...x, file: e.target.files?.[0] } : x
                      ),
                    }))
                  }
                />
              </div>
            ))}

            <button onClick={addAlbumTrack} className="btn-glass">
              + Add Track
            </button>
            <button onClick={submitAlbum} className="btn-submit">
              Release Album
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
