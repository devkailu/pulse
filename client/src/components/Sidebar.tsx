import React, { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { useAuthStore } from "../state/useAuthStore";
import { useNavigate } from "react-router-dom";

type Artist = { id: number; name: string };
type Playlist = { id: number; name: string };

const dummyFollowing: Artist[] = [
  { id: 1, name: "The Weeknd" },
  { id: 2, name: "Dua Lipa" },
  { id: 3, name: "Drake" },
  { id: 4, name: "Adele" },
];

const initialPlaylists: Playlist[] = [
  { id: 1, name: "Playlist1" },
  { id: 2, name: "Playlist2" },
];

export default function Sidebar() {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleAdd = () => {
    setIsAdding(true);
    setNewName("");
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newName.trim() !== "") {
      setPlaylists((prev) => [
        ...prev,
        { id: prev.length + 1, name: newName.trim() },
      ]);
      setIsAdding(false);
      setNewName("");
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewName("");
    }
  };

  const doLogout = () => {
    logout();
    navigate("/login/user"); // back to login
  };

  return (
    <aside className="w-72 h-[calc(100vh-80px)] text-white flex flex-col gap-6 glass-dark px-8 py-6">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border border-white/8 bg-white/6 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-2xl font-semibold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div>
          <div className="font-semibold">{user?.display_name || user?.username || "Guest"}</div>
          <div className="text-sm text-white/60">
            {user ? (user.role === "premium" ? "Premium Plan" : "Free Plan") : "Not logged in"}
          </div>
        </div>
      </div>

      {/* Logout button */}
      {user && (
        <button
          onClick={doLogout}
          className="flex items-center gap-2 px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition text-sm font-medium w-fit"
        >
          <LogOut size={16} />
          Logout
        </button>
      )}

      <div className="border-r border-transparent" />

      {/* Following */}
      <div>
        <div className="text-lg font-bold mb-3">Following</div>
        <ul className="space-y-2 text-white/85">
          {dummyFollowing.map((artist) => (
            <li key={artist.id} className="hover:text-white cursor-pointer">
              {artist.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Playlists */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold">Your Playlists</div>
          <button
            onClick={handleAdd}
            className="p-1 rounded hover:bg-white/10 transition"
          >
            <Plus size={18} />
          </button>
        </div>
        <ul className="space-y-2 text-white/85">
          {playlists.map((pl) => (
            <li key={pl.id} className="hover:text-white cursor-pointer">
              {pl.name}
            </li>
          ))}

          {/* Input for new playlist */}
          {isAdding && (
            <li>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleSubmit}
                onBlur={() => {
                  setIsAdding(false);
                  setNewName("");
                }}
                className="w-full bg-transparent border-b border-white/20 focus:outline-none focus:border-white text-white text-sm"
                placeholder="New Playlist"
              />
            </li>
          )}
        </ul>
      </div>

      <div className="mt-auto mb-6 text-sm text-white/60">© Pulse</div>
    </aside>
  );
}
