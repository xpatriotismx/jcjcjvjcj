import type { PlayerSummary, ShelterView } from "@sehemistan/contracts";
import { motion } from "framer-motion";
import { Clock3, Coins, Crown, DoorOpen, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, formatDuration, formatMoney } from "../lib/api";

interface ShelterResponse {
  active: ShelterView | null;
  history: ShelterView[];
  rules: {
    hourlyMoneyCost: string;
    nineHourGoldCost: string;
    normalMoneyMaxHours: number;
    normalGoldHours: number;
  };
}

interface ShelterPageProps {
  token: string;
  player: PlayerSummary;
  initialShelter: ShelterView | null;
  onPlayerChange(player: PlayerSummary): void;
  onShelterChange(shelter: ShelterView | null): void;
}

export function ShelterPage({
  token,
  player,
  initialShelter,
  onPlayerChange,
  onShelterChange
}: ShelterPageProps) {
  const [data, setData] = useState<ShelterResponse | null>(null);
  const [hours, setHours] = useState(player.isVip ? 12 : 6);
  const [type, setType] = useState<"STANDARD" | "FORTIFIED" | "COMMAND">("STANDARD");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);

  const load = async () => {
    const response = await api<ShelterResponse>("/api/shelters", {}, token);
    setData(response);
    onShelterChange(response.active);
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => tick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const active = data?.active ?? initialShelter;
  const quote = useMemo(() => {
    if (!data) return "";
    if (!player.isVip && hours === 9) return `${data.rules.nineHourGoldCost} altın`;
    return `₺ ${formatMoney((BigInt(data.rules.hourlyMoneyCost) * BigInt(hours)).toString())}`;
  }, [data, hours, player.isVip]);

  const rent = async () => {
    setBusy(true);
    setNotice("");
    try {
      const response = await api<{ shelter: ShelterView; player: PlayerSummary }>("/api/shelters/rent", {
        method: "POST",
        body: JSON.stringify({ durationHours: hours, type })
      }, token);
      onPlayerChange(response.player);
      onShelterChange(response.shelter);
      setNotice("Sığınak koruması etkinleştirildi.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Kiralama tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      await api("/api/shelters/leave", { method: "POST" }, token);
      onShelterChange(null);
      setNotice("Sığınaktan ayrıldın.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="standard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SAVUNMA PROTOKOLÜ</p>
          <h1>Sığınak ağı</h1>
          <p>Düşman operasyonlarından korunmak için güvenli süre satın al.</p>
        </div>
        <span className={`vip-badge ${player.isVip ? "active" : ""}`}>
          <Crown size={16} /> {player.isVip ? "VIP YETKİLİ" : "STANDART HESAP"}
        </span>
      </div>

      {active ? (
        <motion.section className="active-shelter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="shelter-radar">
            <span><ShieldCheck size={38} /></span>
          </div>
          <div className="shelter-active-copy">
            <p className="eyebrow">KORUMA AKTİF</p>
            <h2>{formatDuration(active.endsAt)}</h2>
            <p>{active.type} seviye {active.level} · {active.durationHours} saatlik protokol</p>
          </div>
          <button className="secondary-button danger" onClick={leave} disabled={busy}>
            <DoorOpen size={17} /> Erken ayrıl
          </button>
        </motion.section>
      ) : (
        <section className="shelter-grid">
          <div className="shelter-control">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YENİ KİRALAMA</p>
                <h2>Koruma süresini belirle</h2>
              </div>
              <Shield size={24} />
            </div>

            <div className="segmented-control">
              {(["STANDARD", "FORTIFIED", "COMMAND"] as const).map((item) => (
                <button key={item} className={type === item ? "selected" : ""} onClick={() => setType(item)}>
                  {item === "STANDARD" ? "Standart" : item === "FORTIFIED" ? "Güçlendirilmiş" : "Komuta"}
                </button>
              ))}
            </div>

            <label className="range-label">
              <span>Süre <strong>{hours} saat</strong></span>
              {player.isVip ? (
                <input type="range" min="1" max="72" value={hours} onChange={(event) => setHours(Number(event.target.value))} />
              ) : (
                <div className="hour-options">
                  {[1, 3, 6, 9].map((value) => (
                    <button key={value} onClick={() => setHours(value)} className={hours === value ? "selected" : ""}>
                      {value}s
                    </button>
                  ))}
                </div>
              )}
            </label>

            <div className="quote-row">
              <span><Coins size={18} /> Toplam bedel</span>
              <strong>{quote}</strong>
            </div>
            {notice && <div className="inline-notice">{notice}</div>}
            <button className="primary-button" onClick={rent} disabled={busy || !data}>
              <ShieldCheck size={18} /> Koruma başlat
            </button>
          </div>

          <aside className="rules-panel">
            <p className="eyebrow">ERİŞİM KURALLARI</p>
            <div className="rule-item">
              <Clock3 size={19} />
              <div><strong>1-6 saat</strong><span>Standart oyuncu · oyun parası</span></div>
            </div>
            <div className="rule-item">
              <Coins size={19} />
              <div><strong>Tam 9 saat</strong><span>Standart oyuncu · altın</span></div>
            </div>
            <div className="rule-item">
              <Crown size={19} />
              <div><strong>Süre sınırı yok</strong><span>VIP oyuncu · oyun parası</span></div>
            </div>
            <p className="rules-footnote">Saatlik bedel ₺10M. Erken çıkışta iade yapılmaz.</p>
          </aside>
        </section>
      )}

      <section className="history-section">
        <div className="section-heading">
          <div><p className="eyebrow">KAYITLAR</p><h2>Son sığınak hareketleri</h2></div>
        </div>
        <div className="history-list">
          {(data?.history ?? []).map((item) => (
            <div className="history-row" key={item.id}>
              <span className={`history-state ${item.status.toLowerCase()}`} />
              <strong>{item.type}</strong>
              <span>{item.durationHours} saat</span>
              <span>{item.currency === "MONEY" ? `₺ ${formatMoney(item.cost)}` : `${item.cost} altın`}</span>
              <time>{new Date(item.startsAt).toLocaleString("tr-TR")}</time>
            </div>
          ))}
          {!data?.history.length && <p className="empty-state">Henüz sığınak kaydı yok.</p>}
        </div>
      </section>
    </div>
  );
}
