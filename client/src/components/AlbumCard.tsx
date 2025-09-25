import { getUploadUrl } from "../constants";
import { useNavigate } from "react-router-dom";

type Album = {
  id: number;
  title: string;
  artist: string;
  cover?: string;
};

export default function AlbumCard({ album }: { album: Album }) {
  const navigate = useNavigate();

  const coverUrl = album.cover ? getUploadUrl(album.cover.startsWith("/") ? album.cover : `/uploads/${album.cover}`) : undefined;

  return (
    <div
      onClick={() => navigate(`/album/${album.id}`)} // ✅ path param
      className="w-40 flex flex-col gap-3 cursor-pointer transition duration-200 hover:brightness-125 hover:bg-white/10 p-2 rounded-xl"
    >
      <div className="w-36 h-36 rounded-xl border border-white/20 p-2 overflow-hidden flex items-center justify-center bg-white/10">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={album.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-sky-400/30 to-indigo-700/20 flex items-center justify-center text-white font-semibold">
            ◼
          </div>
        )}
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <div className="text-sm font-semibold">{album.title}</div>
        <div className="text-xs text-white/60">{album.artist}</div>
      </div>
    </div>
  );
}
