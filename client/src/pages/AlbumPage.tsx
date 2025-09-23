// src/pages/AlbumPage.tsx
import TrackCard from "../components/TrackCard";

const dummyAlbum = {
  id: 1,
  title: "Dreamscape",
  artist: "Alice",
  year: 2024,
  tracks: [
    { id: 1, title: "Intro", artist: "Alice", duration: "1:20" },
    { id: 2, title: "Sky High", artist: "Alice", duration: "3:45" },
    { id: 3, title: "Ocean Waves", artist: "Alice", duration: "4:05" },
  ],
};

// helper to compute total time from mm:ss
function computeTotalDuration(tracks: { duration: string }[]) {
  let totalSeconds = 0;
  for (const t of tracks) {
    const [m, s] = t.duration.split(":").map(Number);
    totalSeconds += m * 60 + s;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function AlbumPage() {
  const totalDuration = computeTotalDuration(dummyAlbum.tracks);

  return (
    <div className="glass p-8 space-y-10">
      {/* Album header */}
      <header className="flex items-center gap-8">
        {/* Cover art placeholder */}
        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-xl">
          Cover
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">{dummyAlbum.title}</h1>
          <p className="text-gray-300 text-lg">
            {dummyAlbum.artist} • {dummyAlbum.year}
          </p>
          <p className="text-gray-400 mt-2">
            {dummyAlbum.tracks.length} songs • {totalDuration}
          </p>
        </div>
      </header>

      {/* Track list */}
      <section className="space-y-2">
        {/* Column headers */}
        <div className="grid grid-cols-[40px_1fr_100px_60px] px-4 py-2 text-sm text-gray-400 uppercase tracking-wider">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span className="text-right">Duration</span>
        </div>

        {dummyAlbum.tracks.map((t) => (
          <TrackCard key={t.id} track={t} />
        ))}
      </section>
    </div>
  );
}
