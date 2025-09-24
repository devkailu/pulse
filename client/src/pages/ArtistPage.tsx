// src/pages/ArtistPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AlbumCard from "../components/AlbumCard";
import TrackCard from "../components/TrackCard";

interface Album {
  id: number;
  title: string;
  year: number;
  cover_url?: string | null;
}

interface Single {
  id: number;
  title: string;
  duration: string;
  release_date: string;
}

interface Artist {
  id: number;
  name: string;
  followers: number;
  bio: string;
  avatar?: string | null;
  albums: Album[];
  singles: Single[];
}

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/artists/${id}`);
        if (!res.ok) throw new Error("Failed to fetch artist");
        const data: Artist = await res.json();
        setArtist(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching artist");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20">Loading artist...</div>;
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;
  if (!artist) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="glass p-8 flex items-center gap-10">
        {/* Avatar */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-2xl border border-white/10">
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            artist.name.charAt(0)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{artist.name}</h1>
          <p className="text-gray-300">
            {artist.followers.toLocaleString()} followers
          </p>
          <p className="text-gray-400 max-w-2xl">{artist.bio}</p>

          <button className="mt-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition">
            Follow
          </button>
        </div>
      </header>

      {/* Albums first */}
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-semibold">Albums</h2>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {artist.albums.map((album) => (
            <div key={album.id} className="min-w-[160px] flex-shrink-0 text-center">
              <AlbumCard
                album={{ id: album.id, title: album.title, artist: artist.name }}
              />
              <p className="text-sm text-gray-400 mt-1">{album.year}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Singles below */}
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-semibold">Singles</h2>

        <div className="hidden md:grid grid-cols-[40px_1fr_140px_100px_60px] gap-4 px-4 py-2 text-sm text-gray-400 font-semibold border-b border-white/10">
          <div>#</div>
          <div>Title</div>
          <div>Release</div>
          <div className="text-center">Add</div>
          <div className="text-right">Dur</div>
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {artist.singles.map((track, idx) => (
            <TrackCard key={track.id} track={{ ...track, artist: artist.name, index: idx + 1 }} />
          ))}
        </div>
      </section>
    </div>
  );
}
