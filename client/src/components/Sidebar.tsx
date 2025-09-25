import React, { useEffect, useState } from "react";
import { Plus, LogOut, Trash2 } from "lucide-react";
import { useAuthStore } from "../state/useAuthStore";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../utils/avatar";
import { api } from "../services/api";
import { Link } from "react-router-dom";

type Playlist = { id: number; name: string; description?: string; created_at?: string };

export default function Sidebar() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  /** Fetch playlists safely from backend */
  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/playlists");
      // Ensure we always get an array
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.playlists)
        ? res.data.playlists
        : [];
      setPlaylists(data);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleAdd = () => {
    setIsAdding(true);
    setNewName("");
  };

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newName.trim() !== "") {
      const name = newName.trim();
      setIsAdding(false);
      setNewName("");

      try {
        const res = await api.post("/api/playlists", { name });
        console.log("DEBUG: POST /playlists response:", res.data);

        // Safely add the new playlist to state
        const created = res.data?.playlist;
        if (created) setPlaylists((prev) => [created, ...prev]);
        else {
          alert("Failed to create playlist. Backend did not return playlist object.");
        }
      } catch (err) {
        console.error("Failed to create playlist", err);
        alert("Failed to create playlist. Try again.");
      }
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewName("");
    }
  };

  const doDelete = async (id: number) => {
    if (!confirm("Delete this playlist? This will remove it and its songs from this playlist.")) return;

    try {
      await api.delete(`/api/playlists/${id}`);
      await loadPlaylists(); // refresh after deleting
    } catch (err) {
      console.error("Failed to delete playlist", err);
      alert("Failed to delete playlist. Try again.");
    }
  };

  const doLogout = () => {
    logout();
    navigate("/login/user");
  };

  return (
    <aside className="w-72 h-[calc(100vh-80px)] text-white flex flex-col gap-6 glass-dark px-8 py-6">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border border-white/8 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {user?.avatar_url ? (
            <img src={getAvatarUrl(user.avatar_url)} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold">{user?.username?.[0]?.toUpperCase() || "U"}</span>
          )}
        </div>

        <div>
          <div className="font-semibold">{user?.display_name || user?.username || "Guest"}</div>
          <div className="text-sm text-white/60">
            {user ? (user.role === "premium" ? "Premium Plan" : "Free Plan") : "Not logged in"}
          </div>
        </div>
      </div>

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
          <li className="hover:text-white cursor-pointer">The Weeknd</li>
          <li className="hover:text-white cursor-pointer">Dua Lipa</li>
          <li className="hover:text-white cursor-pointer">Drake</li>
          <li className="hover:text-white cursor-pointer">Adele</li>
        </ul>
      </div>

      {/* Playlists */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold">Your Playlists</div>
          <button onClick={handleAdd} className="p-1 rounded hover:bg-white/10 transition">
            <Plus size={18} />
          </button>
        </div>

        <ul className="space-y-0">
          {loading ? (
            <div className="text-sm text-white/60">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="text-sm text-white/60">No playlists</div>
          ) : (
            playlists.map((pl) => (
            <li
              key={pl.id}
              className="group flex items-center justify-between rounded px-3 py-2 hover:bg-white/20 transition"
            >
              <Link
                to={`/playlists/${pl.id}`}
                className="truncate cursor-pointer flex-1"
                title={pl.name}
              >
                {pl.name}
              </Link>
              <button
                onClick={() => doDelete(pl.id)}
                className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-white/10"
                title="Delete playlist"
              >
                <Trash2 size={14} />
              </button>
            </li>
            ))
          )}

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
