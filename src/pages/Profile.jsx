import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const accentOptions = [
  { key: "purple", label: "Roxo", color: "bg-violet-500", ring: "ring-violet-400" },
  { key: "blue",   label: "Azul",  color: "bg-blue-500",   ring: "ring-blue-400" },
  { key: "green",  label: "Verde", color: "bg-emerald-500", ring: "ring-emerald-400" },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil & Preferências</h1>
            <p className="text-sm text-gray-400 mt-1">Gerencie suas informações e personalize o sistema.</p>
          </div>

          {/* User Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Conta</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0" style={{background:"var(--accent)"}}>
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "—"}</p>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Aparência</h2>

            {/* Dark / Light */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Modo escuro</p>
                <p className="text-xs text-gray-400 mt-0.5">Alterna entre tema claro e escuro.</p>
              </div>
              <button onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-violet-500" : "bg-gray-200 dark:bg-gray-700"}`}
                style={theme === "dark" ? {background:"var(--accent)"} : {}}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`}/>
              </button>
            </div>

            {/* Accent color */}
            <div className="pt-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Cor de destaque</p>
              <p className="text-xs text-gray-400 mb-4">Afeta botões, links e elementos interativos.</p>
              <div className="flex gap-3">
                {accentOptions.map(opt => (
                  <button key={opt.key} onClick={() => setAccent(opt.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${accent === opt.key ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                    <span className={`w-8 h-8 rounded-full ${opt.color} ${accent === opt.key ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ${opt.ring}` : ""}`}/>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sessão</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Encerrar sessão</p>
                <p className="text-xs text-gray-400 mt-0.5">Você será redirecionado para o login.</p>
              </div>
              <button onClick={handleLogout} disabled={loggingOut}
                className="px-4 py-2 rounded-xl text-sm font-medium text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all disabled:opacity-60 flex items-center gap-2">
                {loggingOut && <div className="w-3.5 h-3.5 border border-rose-400 border-t-transparent rounded-full animate-spin"/>}
                Sair
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
