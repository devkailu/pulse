import { create } from "zustand";

export type User = {
  user_id: number;
  username: string;
  role: string;
  display_name?: string;
  avatar?: string; // optional avatar from signup
};

export type AuthState = {
  user: User | null;
  token: string | null;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
};

// Hydrate initial state from localStorage
const storedToken = localStorage.getItem("pulse_token");
const storedUser = localStorage.getItem("pulse_user");

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,

  setUser: (user) => {
    if (user) localStorage.setItem("pulse_user", JSON.stringify(user));
    else localStorage.removeItem("pulse_user");
    set({ user });
  },

  setToken: (token) => {
    if (token) localStorage.setItem("pulse_token", token);
    else localStorage.removeItem("pulse_token");
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("pulse_token");
    localStorage.removeItem("pulse_user");
    set({ user: null, token: null });
  },
}));
