// src/App.tsx
import { Routes, Route } from "react-router-dom";
import LoginUser from "./pages/auth/LoginUser";
import LoginArtist from "./pages/auth/LoginArtist";
import SignupUser from "./pages/auth/SignupUser";
import SignupArtist from "./pages/auth/SignupArtist";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import AlbumPage from "./pages/AlbumPage";
import ArtistPage from "./pages/ArtistPage";
import PlaylistPage from "./pages/PlaylistPage";
import ArtistDashboard from "./pages/ArtistDashboard";

export default function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login/user" element={<LoginUser />} />
      <Route path="/login/artist" element={<LoginArtist />} />
      <Route path="/signup/user" element={<SignupUser />} />
      <Route path="/signup/artist" element={<SignupArtist />} />

      {/* Main layout (no protection for now) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />        
        <Route path="album/:id" element={<AlbumPage />} />
        <Route path="artist/:id" element={<ArtistPage />} />
        <Route path="artist-dashboard" element={<ArtistDashboard />} />
        <Route path="playlists/:id" element={<PlaylistPage />} />
        <Route path="search" element={<div className="glass p-6">Search Page</div>} />
        <Route path="search" element={<div className="glass p-6">Search Page</div>} />
      </Route>
    </Routes>
  );
}
