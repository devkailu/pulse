import { useState } from "react";
import { signupArtist } from "../../services/auth";
import { useNavigate } from "react-router-dom";

interface ArtistForm {
  username: string;
  email: string;
  password: string;
  stage_name: string;
  bio: string;
  country: string;
  start_year?: number;
  avatar: string;
}

export default function SignupArtist() {
  const [form, setForm] = useState<ArtistForm>({
    username: "",
    email: "",
    password: "",
    stage_name: "",
    bio: "",
    country: "",
    start_year: undefined,
    avatar: "",
  });

  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "start_year") {
      setForm((prev) => ({ ...prev, start_year: value ? Number(value) : undefined }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, avatar: url }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signupArtist(form); // start_year already number | undefined
      alert("Artist account created! You can now login.");
      nav("/login/artist");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{
        backgroundImage: `url('/bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create Pulse Artist
        </h2>

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden bg-white/10">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-white/60">No Photo</span>
            )}
          </div>
          <label className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium transition">
            Choose Photo
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        </div>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none"
          required
        />

        <input
          name="stage_name"
          placeholder="Stage Name"
          value={form.stage_name}
          onChange={onChange}
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none"
        />

        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={onChange}
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none resize-none"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none"
          required
        />

        <input
          name="start_year"
          type="number"
          placeholder="Start Year"
          value={form.start_year ?? ""}
          onChange={onChange}
          className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none"
        />

        <button
          type="submit"
          className="w-full py-3 rounded bg-indigo-500 hover:bg-indigo-400 transform transition-all duration-200 hover:scale-105 font-semibold"
        >
          Create Artist Account
        </button>
      </form>
    </div>
  );
}
