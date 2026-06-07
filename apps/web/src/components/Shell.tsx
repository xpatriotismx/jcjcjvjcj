import type { PlayerSummary } from "@sehemistan/contracts";
import {
  Castle,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Swords,
  X
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { formatMoney } from "../lib/api";

interface ShellProps {
  player: PlayerSummary;
  children: ReactNode;
  socketStatus: "offline" | "connecting" | "online";
  onLogout(): void;
}

const navItems = [
  { to: "/", label: "Komuta", icon: LayoutDashboard },
  { to: "/shelter", label: "Sığınak", icon: Shield },
  { to: "/battle", label: "Savaş", icon: Swords },
  { to: "/chat", label: "Ulak Ağı", icon: MessageSquare }
];

export function Shell({ player, children, socketStatus, onLogout }: ShellProps) {
  const [open, setOpen] = useState(false);
  const items = player.role === "ADMIN"
    ? [...navItems, { to: "/admin", label: "Yönetim", icon: Crown }]
    : navItems;

  return (
    <div className="app-frame">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><Castle size={22} /></span>
          <div>
            <strong>SEHEMISTAN</strong>
            <span>Operasyon Ağı</span>
          </div>
          <button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Menüyü kapat">
            <X size={19} />
          </button>
        </div>

        <nav className="main-nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="profile-topline">
            <span className="avatar">{player.username.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{player.username}</strong>
              <small>Seviye {player.level} {player.isVip ? "· VIP" : ""}</small>
            </div>
          </div>
          <div className="balance-row">
            <span>₺ {formatMoney(player.money)}</span>
            <span>{formatMoney(player.gold)} ALTIN</span>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={16} /> Oturumu kapat
          </button>
        </div>
      </aside>

      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Menüyü kapat" />}

      <section className="content-column">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setOpen(true)} aria-label="Menüyü aç">
            <Menu size={20} />
          </button>
          <div className="server-state">
            <span className={`state-dot ${socketStatus}`} />
            {socketStatus === "online" ? "Canlı ağ bağlı" : socketStatus === "connecting" ? "Ağa bağlanıyor" : "Ağ çevrim dışı"}
          </div>
          <div className="topbar-stat">
            <span>GÜÇ</span>
            <strong>{player.power}</strong>
          </div>
          <div className="topbar-stat">
            <span>CAN</span>
            <strong>{player.health}</strong>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </section>
    </div>
  );
}
