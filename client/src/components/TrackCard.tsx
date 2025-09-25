// src/components/TrackCard.tsx
import { Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

type Track = {
  id: number;
  title: string;
  artist: string;
  duration: string;
  releaseDate?: string;
  index?: number;
};

type Playlist = {
  id: number;
  name: string;
};

export default function TrackCard({
  track,
  onRemoveFromPlaylist,
}: {
  track: Track;
  onRemoveFromPlaylist?: (trackId: number) => void;
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const res = await api.get("/api/playlists");
        setPlaylists(res.data);

        // Fetch which playlists already have this track
        const playlistIds: number[] = [];
        for (const pl of res.data) {
          const plRes = await api.get(`/api/playlists/${pl.id}`);
          if (plRes.data.tracks.some((t: Track) => t.id === track.id)) {
            playlistIds.push(pl.id);
          }
        }
        setSelectedPlaylists(playlistIds);
      } catch (err) {
        console.error("Failed to fetch playlists", err);
      }
    };
    loadPlaylists();
  }, [track.id]);

  const togglePlaylist = async (playlistId: number) => {
    const isSelected = selectedPlaylists.includes(playlistId);
    try {
      if (isSelected) {
        await api.delete(`/api/playlists/${playlistId}/songs/${track.id}`);
        setSelectedPlaylists((prev) => prev.filter((id) => id !== playlistId));

        // 🔹 remove track from playlist page immediately
        onRemoveFromPlaylist?.(track.id);
      } else {
        await api.post(`/api/playlists/${playlistId}/songs`, { songId: track.id });
        setSelectedPlaylists((prev) => [...prev, playlistId]);
      }
    } catch (err) {
      console.error("Failed to update playlist", err);
    }
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return "";
    try {
      return new Date(isoDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div
      className={`group grid items-center px-4 py-3 rounded-lg bg-gray-800/60 hover:bg-gray-700/80 transition-colors relative 
      ${track.releaseDate ? "grid-cols-[40px_1fr_140px_100px_60px]" : "grid-cols-[40px_1fr_100px_60px]"}`}
    >
      <div className="w-8 text-gray-400">
        <span className="group-hover:hidden">{track.index ?? track.id}</span>
        <Play size={18} className="hidden group-hover:block cursor-pointer" />
      </div>

      <div>
        <p className="font-medium">{track.title}</p>
        <p className="text-sm text-gray-400">{track.artist}</p>
      </div>

      {track.releaseDate && <div className="text-gray-400">{formatDate(track.releaseDate)}</div>}

      <div className="relative flex justify-center group/plus">
        <button className="p-1 rounded hover:bg-gray-600/50">
          <Plus />
        </button>
        <div className="absolute right-0 mt-9 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover/plus:opacity-100 group-hover/plus:visible transition-opacity z-10">
          <div className="p-2 text-gray-200 font-semibold border-b border-gray-700">
            Add to playlist
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {playlists.map((pl) => (
              <li
                key={pl.id}
                className="flex items-center px-3 py-2 hover:bg-gray-700/60 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPlaylists.includes(pl.id)}
                  onChange={() => togglePlaylist(pl.id)}
                  className="mr-2"
                />
                {pl.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-right text-gray-400">{track.duration}</div>
    </div>
  );
}
