import { useState, useEffect } from "react";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import { useAuthStore } from "../state/useAuthStore";
import { api } from "../services/api";

type Artist = {
  id: number;
  name: string;
  avatar?: string | null; // match backend
};

type Album = {
  id: number;
  title: string;
  artist_name: string;
  cover_url?: string;
  created_at: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const [localUser, setLocalUser] = useState(user);
  const displayName = localUser?.display_name || localUser?.username || "Guest";

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user if not already in store
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setLocalUser(res.data.user);
        useAuthStore.setState({ user: res.data.user }); // update global store
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (!user) fetchUser();
  }, [user]);

  // Fetch artists and albums
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsRes, albumsRes] = await Promise.all([
          api.get<Artist[]>("/api/artists/artists?sort=alphabetical"),
          api.get<Album[]>("/api/albums?sort=recent"),
        ]);

        // Backend might send `avatar` field
        const artistsWithAvatar = (artistsRes.data || []).map((a) => ({
          id: a.id,
          name: a.name,
          avatar: (a as any).avatar || null, // normalize
        }));

        setArtists(artistsWithAvatar);
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
                    artist: al.artist_name,
                    cover: al.cover_url || undefined,
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
