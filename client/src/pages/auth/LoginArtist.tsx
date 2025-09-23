import { useState } from 'react';
import { login } from '../../services/auth';
import { useAuthStore } from '../../state/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function LoginArtist() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();   // ✅ pull from store
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ ...form, accountType: 'artist' });
      console.log('Artist logged in:', res);

      // ✅ assume your backend returns { user, token }
      setUser(res.user);
      setToken(res.token);

      navigate('/artist-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{
        backgroundImage: `url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Pulse Login (Artist)</h2>

        {error && <p className="mb-4 text-red-400 text-center">{error}</p>}

        <input
          type="text"
          name="usernameOrEmail"
          placeholder="Username or Email"
          value={form.usernameOrEmail}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded bg-white/20 text-white placeholder-white outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-6 p-3 rounded bg-white/20 text-white placeholder-white outline-none"
        />

        <button
          type="submit"
          className="w-full py-3 rounded bg-indigo-500 hover:bg-indigo-400 transform transition-all duration-200 hover:scale-105 font-semibold"
        >
          Login
        </button>
        <div className="mt-4 text-sm flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/signup/artist')}
            className="text-indigo-300 hover:underline"
          >
            Artist Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
