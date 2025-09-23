// src/pages/PlaylistPage.tsx
import TrackCard from "../components/TrackCard";

const dummyPlaylist = {
  id: 1,
  name: "Chill Vibes",
  createdBy: "User123",
  tracks: [
    { id: 1, title: "Dreaming", artist: "Alice", duration: "2:55" },
    { id: 2, title: "Golden Hour", artist: "Cara", duration: "3:33" },
    { id: 3, title: "Wanderlust", artist: "Danj", duration: "4:12" },
  ],
};

export default function PlaylistPage() {
  return (
    <div className="glass p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{dummyPlaylist.name}</h1>
        <p className="text-gray-400">Created by {dummyPlaylist.createdBy}</p>
      </header>

      <section className="space-y-2">
        {dummyPlaylist.tracks.map((t) => (
          <TrackCard key={t.id} track={t} />
        ))}
      </section>
    </div>
  );
}
