// src/pages/ArtistPage.tsx
import AlbumCard from "../components/AlbumCard";
import TrackCard from "../components/TrackCard";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { BACKEND_URL } from "../constants";

type Track = {
  id: number;
  title: string;
  artist: string;
  duration: string;
  releaseDate?: string;
  index?: number;
};

type Album = {
  id: number;
  title: string;
  year: number;
  artist: string;
  cover?: string;
};

type Artist = {
  id: number;
  name?: string;
  followers?: number;
  bio?: string;
  avatar?: string | null;
  albums?: Album[];
  singles?: Track[];
};

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/artists/${id}`);
        console.log("GET /api/artists/:id response:", res.data);

        if (cancelled) return;
        const data = res.data as any;

        // Defensive defaults
        data.albums = Array.isArray(data.albums) ? data.albums : [];
        data.singles = Array.isArray(data.singles) ? data.singles : [];

        // Normalize avatar (prefix only if starts with '/')
        if (data.avatar && typeof data.avatar === "string" && data.avatar.startsWith("/")) {
          data.avatar = `${BACKEND_URL}${data.avatar}`;
        }

        // Normalize album covers
        data.albums = data.albums.map((album: any) => {
          const rawCover = album.cover_url || album.cover;
          const cover =
            rawCover && typeof rawCover === "string" ? rawCover : null;

          return {
            id: album.id,
            title: album.title,
            year: album.year,
            artist: data.name ?? "",
            cover,
          } as Album;
        });

        setArtist(data);
      } catch (err: any) {
        console.error("Artist fetch error:", err);
        setError(err?.response?.data?.error || err?.message || "Failed to load artist");
        setArtist(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading artist...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!artist || !artist.name) return <div className="p-8 text-center text-gray-400">No artist found</div>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="glass p-8 flex items-center gap-10">
        {/* Avatar */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-2xl border border-white/10 overflow-hidden">
          {artist.avatar ? (
            <img
              src={artist.avatar}
              alt={artist.name || "Artist"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            artist.name?.charAt(0) || "?"
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{artist.name}</h1>
          <p className="text-gray-300">{(artist.followers ?? 0).toLocaleString()} followers</p>
          <p className="text-gray-400 max-w-2xl">{artist.bio || "No bio available."}</p>

          <button className="mt-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition">
            Follow
          </button>
        </div>
      </header>

      {/* Albums */}
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-semibold">Albums</h2>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {artist.albums && artist.albums.length > 0 ? (
            artist.albums.map((album) => (
              <div key={album.id} className="min-w-[160px] flex-shrink-0 text-center">
                <AlbumCard album={album} />
                <p className="text-sm text-gray-400 mt-1">{album.year}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No albums available</p>
          )}
        </div>
      </section>

      {/* Singles */}
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
          {artist.singles && artist.singles.length > 0 ? (
            artist.singles.map((track, idx) => (
              <TrackCard key={track.id} track={{ ...track, artist: artist?.name ?? "", index: idx + 1 }} />
            ))
          ) : (
            <p className="text-gray-400">No singles available</p>
          )}
        </div>
      </section>
    </div>
  );
}
