import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import TrackCard from "../components/TrackCard";

type Track = {
  id: number;
  title: string;
  duration: string;
  audio_url?: string;
};

type Album = {
  id: number;
  title: string;
  artist_name: string;
  artist_id: number;
  cover_url?: string;
  year?: number;
  tracks: Track[];
};

// Helper to compute total duration of album
function computeTotalDuration(tracks: Track[]) {
  let totalSeconds = 0;
  for (const t of tracks) {
    const [m, s] = t.duration.split(":").map(Number);
    totalSeconds += m * 60 + s;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function AlbumPage() {
  const { id: albumId } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;

    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/albums/${albumId}`);
        setAlbum(data);
      } catch (err) {
        console.error("Failed to fetch album:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [albumId]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!album) return <div className="p-8 text-white">Album not found</div>;

  const totalDuration = computeTotalDuration(album.tracks);

  return (
    <div className="glass p-8 space-y-10">
      {/* Album header */}
      <header className="flex items-center gap-8">
        <div className="w-48 h-48 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
          {album.cover_url ? (
            <img
              src={`${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}${album.cover_url}`}
              alt={album.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-xl">
              Cover
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
          <p className="text-gray-300 text-lg">
            <Link
              to={`/artist/${album.artist_id}`}
              className="hover:underline"
            >
              {album.artist_name}
            </Link>{" "}
            • {album.year}
          </p>
          <p className="text-gray-400 mt-2">
            {album.tracks.length} songs • {totalDuration}
          </p>
        </div>
      </header>

      {/* Track list */}
      <section className="space-y-2">
        <div className="grid grid-cols-[40px_1fr_100px_60px] px-4 py-2 text-sm text-gray-400 uppercase tracking-wider">
          <span>#</span>
          <span>Title</span>
          <span className="text-right pr-9">Add</span>
          <span className="text-right">Duration</span>
        </div>

        {album.tracks.map((t, idx) => (
          <TrackCard
            key={t.id}
            track={{
              ...t,
              artist: album.artist_name, // show album artist
              index: idx + 1,
            }}
          />
        ))}
      </section>
    </div>
  );
}
