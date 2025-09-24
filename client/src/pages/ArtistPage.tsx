import AlbumCard from "../components/AlbumCard";
import TrackCard from "../components/TrackCard";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { BACKEND_URL } from "../constants";
import { useAuthStore } from "../state/useAuthStore";

type Track = { id: number; title: string; artist: string; duration: string; releaseDate?: string; index?: number };
type Album = { id: number; title: string; year: number; artist: string; cover?: string };
type Artist = { id: number; name?: string; followers?: number; bio?: string; avatar?: string | null; albums?: Album[]; singles?: Track[] };

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const auth = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!id) {
      console.warn("No artist ID provided in URL");
      setError("Artist ID missing");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchArtist = async () => {
      try {
        setLoading(true);
        setError(null);

        const artistUrl = `/api/artists/${id}`;
        console.log("Fetching artist URL:", `${api.defaults.baseURL}${artistUrl}`);

        const res = await api.get(artistUrl);
        const data = res.data as any;

        data.albums = Array.isArray(data.albums) ? data.albums : [];
        data.singles = Array.isArray(data.singles) ? data.singles : [];

        if (data.avatar && typeof data.avatar === "string" && data.avatar.startsWith("/")) {
          data.avatar = `${BACKEND_URL}${data.avatar}`;
        }

        data.albums = data.albums.map((album: any) => {
          const rawCover = album.cover_url || album.cover;
          const cover = rawCover && typeof rawCover === "string" ? rawCover : null;
          return { id: album.id, title: album.title, year: album.year, artist: data.name ?? "", cover } as Album;
        });

        if (!cancelled) setArtist(data);

        if (auth?.user_id) {
          const followUrl = `/api/artists/${id}/following?user_id=${auth.user_id}`;
          console.log("Fetching follow status URL:", `${api.defaults.baseURL}${followUrl}`);
          const followRes = await api.get(followUrl);
          if (!cancelled) setFollowing(followRes.data.following);
        }
      } catch (err: any) {
        console.error("Artist fetch error:", err);
        if (!cancelled) {
          setError(err?.response?.data?.error || err?.message || "Failed to load artist");
          setArtist(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchArtist();

    return () => {
      cancelled = true;
    };
  }, [id, auth]);

  const toggleFollow = async () => {
    if (!auth?.user_id || !artist?.id) return;
    try {
      setFollowLoading(true);

      if (following) {
        // Optimistically update the UI
        setFollowing(false);
        setArtist((prev) =>
          prev
            ? { ...prev, followers: Math.max((prev.followers ?? 1) - 1, 0) }
            : prev
        );

        await api.delete(`/api/artists/${artist.id}/follow`, {
          data: { user_id: auth.user_id },
        });
      } else {
        // Optimistically update the UI
        setFollowing(true);
        setArtist((prev) =>
          prev ? { ...prev, followers: (prev.followers ?? 0) + 1 } : prev
        );

        await api.post(`/api/artists/${artist.id}/follow`, {
          user_id: auth.user_id,
        });
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      // Revert if API fails
      setFollowing(!following);
      setArtist((prev) =>
        prev
          ? { ...prev, followers: following ? (prev.followers ?? 0) + 1 : Math.max((prev.followers ?? 1) - 1, 0) }
          : prev
      );
    } finally {
      setFollowLoading(false);
    }
  };


  if (loading) return <div className="p-8 text-center text-gray-400">Loading artist...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!artist || !artist.name) return <div className="p-8 text-center text-gray-400">No artist found</div>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="glass p-8 flex items-center gap-10">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-2xl border border-white/10 overflow-hidden">
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.name || "Artist"} className="w-full h-full object-cover rounded-full" />
          ) : (
            artist.name?.charAt(0) || "?"
          )}
        </div>
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{artist.name}</h1>
          <p className="text-gray-300">{(artist.followers ?? 0).toLocaleString()} followers</p>
          <p className="text-gray-400 max-w-2xl">{artist.bio || "No bio available."}</p>
          <button
            className={`mt-3 px-5 py-2 rounded-full border border-white/10 transition ${
              following ? "bg-green-500/20 hover:bg-green-500/30" : "bg-white/5 hover:bg-white/10"
            }`}
            onClick={toggleFollow}
            disabled={followLoading || !auth?.user_id}
          >
            {followLoading ? "..." : following ? "Following" : "Follow"}
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
