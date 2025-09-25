// src/pages/PlaylistPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import TrackCard from "../components/TrackCard";

type Track = {
  id: number;
  title: string;
  duration: string;
  date_added?: string;
  position?: number;
  artists?: string[];
};

type Playlist = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  tracks: Track[]; // FIX: backend returns "tracks"
};

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const res = await api.get(`/api/playlists/${id}`);
        setPlaylist(res.data);
      } catch (err) {
        console.error("Failed to fetch playlist", err);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };
    loadPlaylist();
  }, [id]);

  if (loading) return <div className="glass p-6">Loading playlist...</div>;
  if (!playlist) return <div className="glass p-6">Playlist not found</div>;

  return (
    <div className="glass p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-gray-400">{playlist.description}</p>
        )}
        <p className="text-gray-500 text-sm">
          Created {new Date(playlist.created_at ?? "").toLocaleDateString()}
        </p>
      </header>

      <section className="space-y-2">
        {playlist.tracks.length === 0 ? ( // FIX HERE
          <div className="text-gray-400">No songs in this playlist yet.</div>
        ) : (
          playlist.tracks.map((t, index) => ( // FIX HERE
            <TrackCard
              key={t.id}
              track={{
                ...t,
                artist: t.artists ? t.artists.join(", ") : "Unknown Artist",
                index: index + 1,
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}
