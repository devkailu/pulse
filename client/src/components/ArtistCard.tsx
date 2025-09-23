import { BACKEND_URL } from "../constants";
import { useNavigate } from "react-router-dom";

type Artist = {
  id: number;
  name: string;
  avatar_url?: string;
};

export default function ArtistCard({ artist }: { artist: Artist }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/artist/${artist.id}`)} // ✅ path param
      className="w-32 flex flex-col gap-3 items-center cursor-pointer transition duration-200 hover:brightness-125 hover:bg-white/10 p-2 pb-5 rounded-xl"
    >
      <div className="w-24 h-24 rounded-full border border-white/20 p-1 overflow-hidden flex items-center justify-center bg-white/5">
        {artist.avatar_url ? (
          <img
            src={`${BACKEND_URL}${artist.avatar_url}`}
            alt={artist.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-semibold rounded-full">
            ◼
          </div>
        )}
      </div>
      <div className="text-sm text-center font-semibold">{artist.name}</div>
    </div>
  );
}
