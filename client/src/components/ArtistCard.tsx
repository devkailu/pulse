// src/components/ArtistCard.tsx
type Artist = {
  id: number;
  name: string;
  avatar?: string;
};

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <div className="w-36 flex flex-col items-center gap-2">
      <div className="w-20 h-20 rounded-full bg-white/6 border-2 border-white/10 flex items-center justify-center">
        {/* placeholder avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600/40 to-rose-400/30 flex items-center justify-center text-white font-semibold">
          {artist.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="text-sm font-semibold">{artist.name}</div>

      <button className="mt-1 px-3 py-1 rounded-full text-xs border border-white/10 bg-transparent hover:bg-white/8 transition-transform transform hover:scale-105">
        Follow
      </button>
    </div>
  );
}
