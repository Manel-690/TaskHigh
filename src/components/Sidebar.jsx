import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const icons = {
  home: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  tasks: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  history: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  profile: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  sun: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>,
  moon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>,
  logout: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
};

const menuItems = [
  { label: "Dashboard", path: "/", icon: icons.home },
  { label: "Tarefas", path: "/tasks", icon: icons.tasks },
  { label: "Histórico", path: "/history", icon: icons.history },
  { label: "Perfil", path: "/profile", icon: icons.profile },
];

const accentOptions = [
  { key: "purple", color: "bg-violet-500", label: "Roxo" },
  { key: "blue", color: "bg-blue-500", label: "Azul" },
  { key: "green", color: "bg-emerald-500", label: "Verde" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme, accent, setAccent } = useTheme();

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); } catch (e) { console.error(e); }
  };

  const initials = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-screen shadow-sm">
      {/* Brand */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg" style={{background: "var(--accent)"}}>
            T
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">TaskHigh</h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Workspace</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {menuItems.map(({ label, path, icon }) => {
          const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              style={active ? { background: "var(--accent)" } : {}}
            >
              <span className={active ? "opacity-90" : "opacity-60"}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Theme & Accent */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
        {/* Accent picker */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">Cor</p>
          <div className="flex gap-2 px-1">
            {accentOptions.map(({ key, color, label }) => (
              <button key={key} onClick={() => setAccent(key)} title={label}
                className={`w-5 h-5 rounded-full ${color} transition-all ${accent === key ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400" : "opacity-50 hover:opacity-80"}`}
              />
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <span className="opacity-60">{theme === "dark" ? icons.sun : icons.moon}</span>
          {theme === "dark" ? "Modo claro" : "Modo escuro"}
        </button>

        {/* User + Logout */}
        <div className="flex items-center gap-2.5 px-1 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{background:"var(--accent)"}}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Sair"
            className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1 rounded">
            {icons.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}
