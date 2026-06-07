import type { BattleSnapshot, ChatMessageView, PlayerSummary, ShelterView } from "@sehemistan/contracts";
import { LoaderCircle } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { useSocket } from "./hooks/useSocket";
import { api, type AuthResponse } from "./lib/api";
import { LoginPage } from "./pages/LoginPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ShelterPage = lazy(() => import("./pages/ShelterPage").then((module) => ({ default: module.ShelterPage })));
const BattlePage = lazy(() => import("./pages/BattlePage").then((module) => ({ default: module.BattlePage })));
const ChatPage = lazy(() => import("./pages/ChatPage").then((module) => ({ default: module.ChatPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then((module) => ({ default: module.AdminPage })));

interface DashboardResponse {
  player: PlayerSummary;
  activeShelter: ShelterView | null;
  battle: BattleSnapshot | null;
  chat: ChatMessageView[];
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("sehemistan.token"));
  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [shelter, setShelter] = useState<ShelterView | null>(null);
  const [initialBattle, setInitialBattle] = useState<BattleSnapshot | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const socket = useSocket(token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api<DashboardResponse>("/api/game/dashboard", {}, token)
      .then((response) => {
        setPlayer(response.player);
        setShelter(response.activeShelter);
        setInitialBattle(response.battle);
      })
      .catch(() => {
        localStorage.removeItem("sehemistan.token");
        setToken(null);
        setPlayer(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const authenticate = (response: AuthResponse) => {
    localStorage.setItem("sehemistan.token", response.token);
    setToken(response.token);
    setPlayer(response.player);
  };

  const logout = () => {
    localStorage.removeItem("sehemistan.token");
    setToken(null);
    setPlayer(null);
  };

  if (!token) return <LoginPage onAuthenticated={authenticate} />;
  if (loading || !player) {
    return <div className="app-loader"><LoaderCircle className="spin" size={34} /><span>Operasyon ağı hazırlanıyor</span></div>;
  }

  const battle = socket.battle ?? initialBattle;

  return (
    <Shell player={player} socketStatus={socket.status} onLogout={logout}>
      <Suspense fallback={<div className="route-loader"><LoaderCircle className="spin" size={26} /></div>}>
        <Routes>
          <Route path="/" element={<DashboardPage player={player} shelter={shelter} battle={battle} presence={socket.presence} />} />
          <Route path="/shelter" element={
            <ShelterPage
              token={token}
              player={player}
              initialShelter={shelter}
              onPlayerChange={setPlayer}
              onShelterChange={setShelter}
            />
          } />
          <Route path="/battle" element={<BattlePage battle={battle} send={socket.send} />} />
          <Route path="/chat" element={<ChatPage messages={socket.messages} presence={socket.presence} send={socket.send} />} />
          <Route path="/admin" element={player.role === "ADMIN" ? <AdminPage token={token} /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
