import { useState } from 'react';
import { login } from '../../services/auth';
import { useAuthStore, type AuthState, type User } from '../../state/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function LoginUser() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });

  // Use types from Zustand store directly
  const setUser = useAuthStore((state: AuthState) => state.setUser);
  const setToken = useAuthStore((state: AuthState) => state.setToken);  
  const nav = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await login({ ...form, accountType: 'user' });
      // Map backend user to Zustand user type
      const user: User = {
        user_id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        display_name: data.user.display_name,
      };
      setUser(user);
      setToken(data.token);
      localStorage.setItem('pulse_token', data.token);
      nav('/');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{
      backgroundImage: `url('/bg.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <form onSubmit={submit} className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Pulse Login (User)</h2>
        <input
          placeholder="Username or Email"
          value={form.usernameOrEmail}
          onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
          className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-6 p-3 rounded bg-white/20 text-white placeholder-white outline-none"
        />
        <button type="submit" className="w-full py-3 rounded bg-indigo-500 hover:bg-indigo-400 transform transition-all duration-200 hover:scale-105 font-semibold">
          Login
        </button>
        <div className="mt-4 text-sm flex justify-between">
          <button type="button" onClick={() => nav('/signup/user')} className="text-indigo-300 hover:underline">Sign up</button>
          <button type="button" onClick={() => nav('/login/artist')} className="text-indigo-300 hover:underline">Artist login</button>
        </div>
      </form>
    </div>
  );
}
