import { useState, useEffect } from "react";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import { useAuthStore } from "../state/useAuthStore";
import { api } from "../services/api";

type Artist = {
  id: number;
  name: string;
};

type Album = {
  id: number;
  title: string;
  artist_name: string; // make sure backend sends this!
  cover_url?: string;
  created_at: string;
};

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.display_name || user?.username || "Guest";

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsRes, albumsRes] = await Promise.all([
          api.get<Artist[]>("/api/artists/artists?sort=alphabetical"),
          api.get<Album[]>("/api/albums?sort=recent"),
        ]);
        setArtists(artistsRes.data || []);
        setAlbums(albumsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setArtists([]);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-white mt-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">
        Welcome, <span className="font-medium">{displayName}</span>
      </h1>

      <div className="glass p-6 space-y-8">
        {/* Discover artists */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Discover Artists</h2>
          {artists.length === 0 ? (
            <p className="text-white/60">No artists found.</p>
          ) : (
            <div className="flex gap-6 flex-wrap">
              {artists.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          )}
        </section>

        {/* Discover albums */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Discover Albums</h2>
          {albums.length === 0 ? (
            <p className="text-white/60">No albums found.</p>
          ) : (
            <div className="flex gap-6 flex-wrap">
              {albums.map((al) => (
                <AlbumCard
                  key={al.id}
                  album={{
                    id: al.id,
                    title: al.title,
                    artist: al.artist_name, // ✅ Pass artist name correctly
                    cover: al.cover_url,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
