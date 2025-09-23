// src/pages/ArtistPage.tsx
import AlbumCard from "../components/AlbumCard";
import TrackCard from "../components/TrackCard";

const dummyArtist = {
  id: 1,
  name: "Alice",
  followers: 120345,
  bio: "Alice is a genre-bending artist known for blending dream-pop with electronic elements. Her music is atmospheric, emotional, and often described as otherworldly.",
  avatar: null,
  singles: [
    { id: 1, title: "Sky High", artist: "Alice", duration: "3:45", releaseDate: "2024-06-01" },
    { id: 2, title: "Ocean Waves", artist: "Alice", duration: "4:05", releaseDate: "2023-11-20" },
    { id: 3, title: "Moonlight Drive", artist: "Alice", duration: "3:32", releaseDate: "2022-09-10" },
    { id: 4, title: "Falling Stars", artist: "Alice", duration: "5:01", releaseDate: "2021-04-08" },
    { id: 5, title: "Dreamscape", artist: "Alice", duration: "4:20", releaseDate: "2020-02-14" },
  ],
  albums: [
    { id: 1, title: "Dreamscape", artist: "Alice", year: 2024 },
    { id: 2, title: "Celestial Nights", artist: "Alice", year: 2022 },
    { id: 3, title: "Echoes", artist: "Alice", year: 2020 },
  ],
};

export default function ArtistPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="glass p-8 flex items-center gap-10">
        {/* Avatar */}
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-400/40 flex items-center justify-center text-white font-bold text-2xl border border-white/10">
          {dummyArtist.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{dummyArtist.name}</h1>
          <p className="text-gray-300">
            {dummyArtist.followers.toLocaleString()} followers
          </p>
          <p className="text-gray-400 max-w-2xl">{dummyArtist.bio}</p>

          <button className="mt-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition">
            Follow
          </button>
        </div>
      </header>

      {/* Albums first */}
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-semibold">Albums</h2>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {dummyArtist.albums.map((album) => (
            <div key={album.id} className="min-w-[160px] flex-shrink-0 text-center">
              <AlbumCard
                album={{ id: album.id, title: album.title, artist: dummyArtist.name }}
              />
              <p className="text-sm text-gray-400 mt-1">{album.year}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Singles below (stacked using TrackCard) */}
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-semibold">Singles</h2>

        {/* Optional header row */}
        <div className="hidden md:grid grid-cols-[40px_1fr_140px_100px_60px] gap-4 px-4 py-2 text-sm text-gray-400 font-semibold border-b border-white/10">
          <div>#</div>
          <div>Title</div>
          <div>Release</div>
          <div className="text-center">Add</div>
          <div className="text-right">Dur</div>
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {dummyArtist.singles.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </section>
    </div>
  );
}
