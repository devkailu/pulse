// src/components/PlayerBar.tsx
import { useState } from "react";

export default function PlayerBar() {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(35);
  const [volume, setVolume] = useState(70);

  return (
    <div className="fixed left-0 right-0 bottom-0 h-[85px] bg-black/60 backdrop-blur-sm border-t border-white/30 flex items-center px-6 text-white z-50">
      {/* Left: song info */}
      <div className="flex items-center gap-4 w-64">
        <div className="w-14 h-14 bg-white/6 rounded-md flex items-center justify-center">Art</div>
        <div>
          <div className="font-semibold">Song name</div>
          <div className="text-xs text-white/60">Artists featured</div>
        </div>
      </div>

      {/* center controls */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-6">
          {/* Play/pause */}
          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/16 transition-transform transform hover:scale-105 flex items-center justify-center"
            aria-label="play"
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M5 3v18l15-9L5 3z" />
              </svg>
            )}
          </button>

          <div className="text-xs text-white/60">2:35</div>

          {/* progress */}
          <div className="w-[520px] px-2">
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="progress"
              className="w-full"
            />
          </div>

          <div className="text-xs text-white/60">4:15</div>

          {/* Repeat button now AFTER timeline */}
          <button
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/16 transition-transform transform hover:scale-105 flex items-center justify-center"
            aria-label="repeat"
          >
            <img src="/repeat.svg" alt="repeat" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* right: speaker + volume slider */}
      <div className="flex items-center gap-4 w-64 justify-end">
        <div className="flex items-center gap-3">
          <img src="/speaker.svg" alt="speaker" className="w-5 h-5 opacity-95" />
          <div className="w-28 px-1">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full range-sm"
              aria-label="volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
