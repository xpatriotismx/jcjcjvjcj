import type { BattleSnapshot, PlayerSummary, ShelterView } from "@sehemistan/contracts";
import { motion } from "framer-motion";
import { Activity, Clock3, ShieldCheck, Swords, Users } from "lucide-react";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { formatDuration, formatMoney } from "../lib/api";

const WorldMap = lazy(() =>
  import("../components/WorldMap").then((module) => ({ default: module.WorldMap }))
);

interface DashboardPageProps {
  player: PlayerSummary;
  shelter: ShelterView | null;
  battle: BattleSnapshot | null;
  presence: number;
}

export function DashboardPage({ player, shelter, battle, presence }: DashboardPageProps) {
  return (
    <div className="dashboard-layout">
      <motion.section className="map-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Suspense fallback={<div className="map-loading">Harita ağı yükleniyor</div>}>
          <WorldMap />
        </Suspense>
        <div className="map-heading">
          <p className="eyebrow">TAKTİK HARİTA</p>
          <h1>Sehemistan</h1>
          <span>Şehir dengesi kırılgan. Bölgeleri canlı olarak izle.</span>
        </div>
        <div className="map-legend">
          <span><i className="legend-dot cyan" /> Kontrol altında</span>
          <span><i className="legend-dot red" /> Çatışma</span>
          <span><i className="legend-dot gold" /> Sığınak</span>
        </div>
      </motion.section>

      <section className="dashboard-side">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DURUM ÖZETİ</p>
            <h2>Komuta merkezi</h2>
          </div>
          <span className="live-pill"><Activity size={14} /> CANLI</span>
        </div>

        <div className="metric-grid">
          <article className="metric">
            <span>Servet</span>
            <strong>₺ {formatMoney(player.money)}</strong>
            <small>Likidite kullanılabilir</small>
          </article>
          <article className="metric">
            <span>Altın</span>
            <strong>{formatMoney(player.gold)}</strong>
            <small>Premium rezerv</small>
          </article>
          <article className="metric">
            <span>Ağ nüfuzu</span>
            <strong>{presence}</strong>
            <small>Aktif bağlantı</small>
          </article>
          <article className="metric">
            <span>Seviye</span>
            <strong>{player.level}</strong>
            <small>Operasyon rütbesi</small>
          </article>
        </div>

        <Link className="status-strip shelter-strip" to="/shelter">
          <span className="status-icon"><ShieldCheck size={21} /></span>
          <div>
            <strong>{shelter ? "Sığınak koruması aktif" : "Sığınak koruması yok"}</strong>
            <small>{shelter ? `${formatDuration(shelter.endsAt)} süre kaldı` : "Savunmasız durumdasın"}</small>
          </div>
          <Clock3 size={17} />
        </Link>

        <Link className="status-strip battle-strip" to="/battle">
          <span className="status-icon"><Swords size={21} /></span>
          <div>
            <strong>{battle ? `${battle.attackerName} / ${battle.defenderName}` : "Aktif cephe yok"}</strong>
            <small>{battle ? `Skor ${battle.attackerScore} - ${battle.defenderScore}` : "Yeni istihbarat bekleniyor"}</small>
          </div>
          <Users size={17} />
        </Link>

        <article className="intel-panel">
          <p className="eyebrow">SON İSTİHBARAT</p>
          <h3>Eski Şehir hattı hareketli</h3>
          <p>Kızıl Konsey birlikleri merkez sığınağa yaklaşırken kuzey geçitlerinde savunma güçleniyor.</p>
          <Link to="/battle">Cepheyi aç</Link>
        </article>
      </section>
    </div>
  );
}
