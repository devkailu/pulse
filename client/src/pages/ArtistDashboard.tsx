import { useState, useEffect } from "react";
import AlbumCard from "../components/AlbumCard";
import TrackCard from "../components/TrackCard";
import { Upload, Plus, Trash2, X } from "lucide-react";
import { useAuthStore } from "../state/useAuthStore";
import axios from "axios";

type Artist = { id: number; name: string };
type Track = {
  id: number;
  title: string;
  file?: File;
  collaborators: { artist_id: number; role: string }[];
};

export default function ArtistDashboard() {
  const { user } = useAuthStore();
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);

  const [single, setSingle] = useState<{ title: string; file?: File; collaborators: any[] }>({
    title: "",
    collaborators: [],
  });
  const [album, setAlbum] = useState<{ name: string; cover?: File; tracks: Track[] }>({
    name: "",
    tracks: [],
  });

  useEffect(() => {
    axios.get("/api/artists/artists").then((res) => setAllArtists(res.data));
  }, []);

  // ---- Helpers ----
  const addAlbumTrack = () => {
    setAlbum((prev) => ({
      ...prev,
      tracks: [...prev.tracks, { id: prev.tracks.length + 1, title: "", collaborators: [] }],
    }));
  };

  const addCollaborator = (trackId: number, artistId: number, role: string) => {
    setAlbum((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, collaborators: [...t.collaborators, { artist_id: artistId, role }] }
          : t
      ),
    }));
  };

  const removeCollaborator = (trackId: number, idx: number) => {
    setAlbum((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, collaborators: t.collaborators.filter((_, i) => i !== idx) }
          : t
      ),
    }));
  };

  // ---- Submit handlers ----
  const submitSingle = async () => {
    if (!user) return;
    const form = new FormData();
    form.append("title", single.title);
    form.append("primary_artist_id", String(user.user_id));
    if (single.file) form.append("audio", single.file);
    form.append("collaborators", JSON.stringify(single.collaborators));

    await axios.post("/api/artists/singles", form);
    setShowSingleModal(false);
  };

  const submitAlbum = async () => {
    if (!user) return;
    const form = new FormData();
    form.append("title", album.name);
    form.append("artist_id", String(user.user_id));
    if (album.cover) form.append("cover", album.cover);

    // prepare tracks payload
    const tracksPayload = album.tracks.map((t) => ({
      title: t.title,
      audio_url: t.file ? URL.createObjectURL(t.file) : "",
      collaborators: t.collaborators,
    }));
    form.append("tracks", JSON.stringify(tracksPayload));

    await axios.post("/api/artists/albums", form);
    setShowAlbumModal(false);
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

      {/* Singles + Albums (list placeholders, fill later) */}
      <section className="glass p-6">
        <h2 className="text-xl font-semibold">Your Albums</h2>
        {/* Map albums from backend here */}
      </section>

      <section className="glass p-6">
        <h2 className="text-xl font-semibold">Your Singles</h2>
        {/* Map singles from backend here */}
      </section>

      {/* --- Single Modal --- */}
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

            <input type="file" accept="audio/*" onChange={(e) => setSingle({ ...single, file: e.target.files?.[0] })} />

            {/* Collaborators */}
            <div className="space-y-2 mt-3">
              <p className="text-sm text-white/60">Add Collaborators</p>
              <select
                onChange={(e) =>
                  addCollaborator(0, Number(e.target.value), "vocals")
                }
                className="input-glass"
              >
                <option value="">Select Artist</option>
                {Array.isArray(allArtists) &&
                allArtists.map((a) => (
                    <option key={a.id} value={a.id}>
                    {a.name}
                    </option>
                ))}
              </select>
              <div className="flex gap-2 flex-wrap">
                {single.collaborators.map((c, i) => (
                  <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm">
                    {allArtists.find((a) => a.id === c.artist_id)?.name} ({c.role})
                    <button onClick={() => removeCollaborator(0, i)} className="ml-1">x</button>
                  </span>
                ))}
              </div>
            </div>

            <button onClick={submitSingle} className="btn-submit">
              Release Single
            </button>
          </div>
        </div>
      )}

      {/* --- Album Modal --- */}
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
            <input type="file" accept="image/*" onChange={(e) => setAlbum({ ...album, cover: e.target.files?.[0] })} />

            {album.tracks.map((t) => (
              <div key={t.id} className="glass p-3 space-y-2">
                <input
                  type="text"
                  placeholder={`Track ${t.id} Title`}
                  value={t.title}
                  onChange={(e) =>
                    setAlbum((prev) => ({
                      ...prev,
                      tracks: prev.tracks.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)),
                    }))
                  }
                  className="input-glass"
                />
                <input type="file" accept="audio/*" onChange={(e) =>
                  setAlbum((prev) => ({
                    ...prev,
                    tracks: prev.tracks.map((x) => (x.id === t.id ? { ...x, file: e.target.files?.[0] } : x)),
                  }))
                } />

                {/* Collaborators */}
                <select onChange={(e) => addCollaborator(t.id, Number(e.target.value), "vocals")} className="input-glass">
                  <option value="">Add Collaborator</option>
                  {allArtists.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 flex-wrap">
                  {t.collaborators.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm">
                      {allArtists.find((a) => a.id === c.artist_id)?.name} ({c.role})
                      <button onClick={() => removeCollaborator(t.id, i)} className="ml-1">x</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={addAlbumTrack} className="btn-glass">
              + Add Track
            </button>
            <button onClick={submitAlbum} className="btn-submit">Release Album</button>
          </div>
        </div>
      )}
    </div>
  );
}
