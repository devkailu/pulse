// src/components/AlbumCard.tsx
type Album = {
  id: number;
  title: string;
  artist: string;
  cover?: string;
};

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="w-36 flex flex-col gap-4">
      <div className="w-36 h-36 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center">
        {/* placeholder cover */}
        <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-sky-400/30 to-indigo-700/20 flex items-center justify-center text-white font-semibold">
          ◼
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm mx-auto font-semibold">{album.title}</div>
        <div className="text-xs mx-auto text-white/60">{album.artist}</div>
      </div>
    </div>
  );
}
