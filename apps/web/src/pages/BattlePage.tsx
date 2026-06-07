import type { BattleSnapshot, ClientSocketMessage } from "@sehemistan/contracts";
import { Crosshair, RadioTower, Shield, Swords, Zap } from "lucide-react";
import { useState } from "react";

export function BattlePage({
  battle,
  send
}: {
  battle: BattleSnapshot | null;
  send(message: ClientSocketMessage): void;
}) {
  const [power, setPower] = useState(55);

  if (!battle) {
    return <div className="empty-full"><Swords size={32} /><h1>Aktif savaş bulunmuyor</h1></div>;
  }

  const total = Math.max(1, battle.attackerScore + battle.defenderScore);
  const attackerWidth = `${Math.round((battle.attackerScore / total) * 100)}%`;

  return (
    <div className="standard-page">
      <div className="page-heading">
        <div><p className="eyebrow">CANLI CEPHE</p><h1>Eski Şehir kuşatması</h1><p>Her saldırı sunucuda kaydedilir ve cephedeki herkese anında iletilir.</p></div>
        <span className="live-pill"><RadioTower size={15} /> REV {battle.revision}</span>
      </div>

      <section className="battle-arena">
        <div className="battle-team attacker">
          <span><Crosshair size={28} /></span>
          <p>SALDIRAN</p>
          <h2>{battle.attackerName}</h2>
          <strong>{battle.attackerScore}</strong>
        </div>
        <div className="versus-mark">VS</div>
        <div className="battle-team defender">
          <span><Shield size={28} /></span>
          <p>SAVUNAN</p>
          <h2>{battle.defenderName}</h2>
          <strong>{battle.defenderScore}</strong>
        </div>
      </section>

      <div className="battle-progress"><span style={{ width: attackerWidth }} /></div>

      <section className="strike-console">
        <div>
          <p className="eyebrow">SALDIRI GÜCÜ</p>
          <h2>{power}</h2>
        </div>
        <input type="range" min="10" max="100" value={power} onChange={(event) => setPower(Number(event.target.value))} />
        <button className="primary-button battle-button" onClick={() => send({ type: "battle.strike", roomId: battle.roomId, power })}>
          <Zap size={19} /> Darbe indir
        </button>
      </section>
    </div>
  );
}
