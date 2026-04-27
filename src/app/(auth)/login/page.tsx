"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email veya şifre hatalı");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="14" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="9" y="1" width="6" height="9" rx="1.5" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">TaskFlow</span>
          </div>
          <p className="text-[#666] text-sm">Hesabına giriş yap</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 px-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-sm text-[#555] mt-6">
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-[#6366f1] hover:text-[#818cf8] transition-colors">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
