import type { PlayerSummary } from "@sehemistan/contracts";
import { Crown, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function AdminPage({ token }: { token: string }) {
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [username, setUsername] = useState("");
  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(0);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const response = await api<{ players: PlayerSummary[] }>("/api/admin/players", {}, token);
    setPlayers(response.players);
  };

  useEffect(() => {
    void load();
  }, []);

  const grant = async () => {
    try {
      await api("/api/admin/grant-vip", {
        method: "POST",
        body: JSON.stringify({ username, days, hours })
      }, token);
      setNotice(`${username} için VIP süresi güncellendi.`);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    }
  };

  return (
    <div className="standard-page">
      <div className="page-heading">
        <div><p className="eyebrow">YÖNETİCİ YETKİSİ</p><h1>Oyuncu kontrolü</h1><p>VIP sürelerini güvenli ve denetlenebilir biçimde yönet.</p></div>
        <Crown size={28} />
      </div>
      <section className="admin-grid">
        <div className="admin-form">
          <div className="section-heading"><div><p className="eyebrow">VIP TANIMLA</p><h2>Süre ekle</h2></div><ShieldCheck /></div>
          <label><span>Kullanıcı adı</span><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Oyuncu ara" /></label>
          <div className="form-split">
            <label><span>Gün</span><input type="number" min="0" value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
            <label><span>Saat</span><input type="number" min="0" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label>
          </div>
          {notice && <div className="inline-notice">{notice}</div>}
          <button className="primary-button" onClick={grant} disabled={!username || (days === 0 && hours === 0)}>
            <Crown size={17} /> VIP süresi ekle
          </button>
        </div>
        <div className="player-table-wrap">
          <div className="table-search"><Search size={17} /><span>Son oyuncular</span></div>
          <div className="player-table">
            {players.map((player) => (
              <button key={player.id} onClick={() => setUsername(player.username)}>
                <span className="avatar small">{player.username.slice(0, 2).toUpperCase()}</span>
                <strong>{player.username}</strong>
                <span>Lv. {player.level}</span>
                <i className={player.isVip ? "vip-on" : ""}>{player.isVip ? "VIP" : "Standart"}</i>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
