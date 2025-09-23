// client/src/pages/auth/signupUser.tsx
import { useState } from "react";
import { signupUser } from "../../services/auth";
import { useNavigate } from "react-router-dom";

interface UserForm {
  username: string;
  email: string;
  password: string;
  display_name: string;
  subscription_id: number;
  avatar?: File;
}

export default function SignupUser() {
  const [form, setForm] = useState<UserForm>({
    username: '',
    email: '',
    password: '',
    display_name: '',
    subscription_id: 1,
    avatar: undefined,
  });

  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "subscription_id") {
      setForm((prev) => ({ ...prev, subscription_id: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((prev) => ({ ...prev, avatar: file }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("display_name", form.display_name);
      formData.append("subscription_id", String(form.subscription_id));
      if (form.avatar) formData.append("avatar", form.avatar);

      await signupUser(formData as any);
      alert("Signup successful! You can now login.");
      nav("/login/user");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Signup failed");
    }
  };

  const avatarPreview = form.avatar ? URL.createObjectURL(form.avatar) : null;

  return (
    <div className="min-h-screen flex items-center justify-center text-white" style={{ backgroundImage: `url('/bg.jpg')`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <form onSubmit={submit} className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Pulse User</h2>

        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden bg-white/10">
            {avatarPreview ? <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover"/> : <span className="text-sm text-white/60">No Photo</span>}
          </div>
          <label className="cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium transition">
            Choose Avatar
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden"/>
          </label>
        </div>

        <input name="username" placeholder="Username" value={form.username} onChange={onChange} className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none" required />
        <input name="display_name" placeholder="Display Name" value={form.display_name} onChange={onChange} className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none" />

        <select name="subscription_id" value={form.subscription_id} onChange={onChange} className="w-full p-3 rounded bg-white/20 text-white outline-none appearance-none" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}>
          <option value={1}>Free</option>
          <option value={99}>Premium (demo)</option>
        </select>

        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className="w-full p-3 rounded bg-white/20 text-white placeholder-white outline-none" required />

        <button type="submit" className="w-full py-3 rounded bg-indigo-500 hover:bg-indigo-400 transform transition-all duration-200 hover:scale-105 font-semibold">Create Account</button>
      </form>
    </div>
  );
}
