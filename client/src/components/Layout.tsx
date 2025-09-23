// src/components/Layout.tsx
import Sidebar from "./Sidebar";
import PlayerBar from "./PlayerBar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-bg h-screen text-white flex flex-col">
      {/* Top area: sidebar + main content */}
      <div className="flex flex-1 pl-0 pr-4 py-8 gap-4 overflow-hidden">
        {/* Sidebar (fixed, no scroll) */}
        <Sidebar />

        {/* Main area (scrollable, minus player height) */}
        <main className="flex-1 overflow-y-auto pr-2 pb-20">
          <Outlet />
        </main>
      </div>

      {/* Player */}
      <PlayerBar />
    </div>
  );
}