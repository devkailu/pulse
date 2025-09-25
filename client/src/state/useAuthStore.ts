import { create } from "zustand";

export type User = {
  user_id: number;
  username: string;
  role: string;
  display_name?: string;
  avatar_url?: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const storedToken = localStorage.getItem("pulse_token");
const storedUser = localStorage.getItem("pulse_user");

export const useAuthStore = create<AuthState>((set) => ({
  // ⚡ Only change: ensure avatar_url is at least null
  user: storedUser
    ? (() => {
        const u = JSON.parse(storedUser);
        if (!("avatar_url" in u)) u.avatar_url = null; // safe fallback
        return u;
      })()
    : null,

  token: localStorage.getItem("pulse_token") || null,

  setUser: (user) => {
    console.log("[AuthStore] setUser called:", user); // 🔹 DEBUG
    if (user) localStorage.setItem("pulse_user", JSON.stringify(user));
    else localStorage.removeItem("pulse_user");
    set({ user });
  },

  setToken: (token) => {
    console.log("[AuthStore] setToken called:", token); // 🔹 DEBUG
    if (token) localStorage.setItem("pulse_token", token);
    else localStorage.removeItem("pulse_token");
    set({ token });
  },

  logout: () => {
    console.log("[AuthStore] logout called"); // 🔹 DEBUG
    localStorage.removeItem("pulse_token");
    localStorage.removeItem("pulse_user");
    set({ user: null, token: null });
  },
}));

// DEBUG: make the store globally accessible
if (typeof window !== "undefined") {
  (window as any).authStore = useAuthStore.getState();
}
