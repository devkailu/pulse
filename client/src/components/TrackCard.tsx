// src/components/TrackCard.tsx
import { Play, Plus } from "lucide-react";
import { useState } from "react";

type Track = {
  id: number;
  title: string;
  artist: string;
  duration: string;
  releaseDate?: string; // optional
  index?: number; // optional: position in the displayed list
};

type Playlist = {
  id: number;
  name: string;
};

const dummyPlaylists: Playlist[] = [
  { id: 1, name: "Chill Vibes" },
  { id: 2, name: "Workout Mix" },
  { id: 3, name: "Favorites" },
];

export default function TrackCard({ track }: { track: Track }) {
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);

  const togglePlaylist = (id: number) => {
    setSelectedPlaylists((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return "";
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString(undefined, {
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
      {/* Track index or play icon */}
      <div className="w-8 text-gray-400">
        <span className="group-hover:hidden">{track.index ?? track.id}</span>
        <Play size={18} className="hidden group-hover:block cursor-pointer" />
      </div>

      {/* Title + artist */}
      <div>
        <p className="font-medium">{track.title}</p>
        <p className="text-sm text-gray-400">{track.artist}</p>
      </div>

      {/* Release date column (optional) */}
      {track.releaseDate && (
        <div className="text-gray-400">{formatDate(track.releaseDate)}</div>
      )}

      {/* Plus button */}
      <div className="relative flex justify-center group/plus">
        <button className="p-1 rounded hover:bg-gray-600/50">
          <Plus />
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 mt-9 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover/plus:opacity-100 group-hover/plus:visible transition-opacity z-10">
          <div className="p-2 text-gray-200 font-semibold border-b border-gray-700">
            Add to playlist
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {dummyPlaylists.map((pl) => (
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

      {/* Duration */}
      <div className="text-right text-gray-400">{track.duration}</div>
    </div>
  );
}
