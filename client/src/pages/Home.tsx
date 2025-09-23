import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import { useAuthStore } from "../state/useAuthStore";

const sampleArtists = ["The Weeknd", "Dua Lipa", "Drake", "Adele", "Taylor Swift"].map((name, i) => ({ id: i, name }));
const sampleAlbums = [
  { id: 0, title: "After Hours", artist: "The Weeknd" },
  { id: 1, title: "Future Nostalgia", artist: "Dua Lipa" },
  { id: 2, title: "Certified Lover Boy", artist: "Drake" },
  { id: 3, title: "30", artist: "Adele" }
];

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.display_name || user?.username || "Guest";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">
        Welcome, <span className="font-medium">{displayName}</span>
      </h1>

      <div className="glass p-6 space-y-8">
        {/* Discover artists */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Discover Artists</h2>
          <div className="flex gap-6">
            {sampleArtists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </section>

        {/* Discover albums */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Discover Albums</h2>
          <div className="flex gap-6">
            {sampleAlbums.map((al) => (
              <AlbumCard key={al.id} album={al} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
