import { Castle, KeyRound, LoaderCircle, RadioTower } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { AuthResponse } from "../lib/api";
import { api } from "../lib/api";

export function LoginPage({ onAuthenticated }: { onAuthenticated(value: AuthResponse): void }) {
  const [username, setUsername] = useState("sehem");
  const [password, setPassword] = useState("Sehemistan!2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      onAuthenticated(response);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <div className="login-visual">
        <img src="/assets/sehemistan-map.png" alt="" />
        <div className="login-visual-overlay" />
        <div className="login-brand">
          <span className="brand-mark large"><Castle size={28} /></span>
          <div>
            <strong>SEHEMISTAN</strong>
            <span>Şehrin kaderi yeniden yazılıyor.</span>
          </div>
        </div>
        <div className="network-chip"><RadioTower size={16} /> 6 bölge aktif</div>
      </div>

      <section className="login-panel">
        <form onSubmit={submit} className="login-form">
          <div>
            <p className="eyebrow">GÜVENLİ ERİŞİM</p>
            <h1>Operasyon merkezine dön.</h1>
            <p className="muted">Kimliğini doğrula ve kaldığın yerden devam et.</p>
          </div>
          <label>
            <span>Kullanıcı adı</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label>
            <span>Parola</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <KeyRound size={18} />}
            Giriş yap
          </button>
          <p className="demo-note">Demo: sehem / Sehemistan!2026</p>
        </form>
      </section>
    </main>
  );
}
