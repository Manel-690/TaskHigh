import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const icons = {
  home: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  ),
  tasks: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m.75-12H6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25V7.875c0-.621-.504-1.125-1.125-1.125H16.5m-3-3h-3madb 3v-1.5a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75V4.5h3.75Z"
      />
    </svg>
  ),
  history: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  profile: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  ),
  admin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  ),
  logout: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5 rotate-180"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
      />
    </svg>
  ),
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, avatar, logout } = useAuth();

  const menu = [
    { label: "Dashboard", path: "/", icon: icons.home },
    { label: "Tarefas", path: "/tasks", icon: icons.tasks },
    { label: "Histórico", path: "/history", icon: icons.history },
    { label: "Perfil", path: "/profile", icon: icons.profile },
  ];

  if (profile?.role === "admin")
    menu.push({ label: "Admin", path: "/admin", icon: icons.admin });

  return (
    <aside className="w-64 flex flex-col bg-white dark:bg-[#0f1117] border-r border-gray-200 dark:border-gray-800 transition-colors">
      <div className="p-6 text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs">
          T
        </div>
        Task<span style={{ color: "var(--accent)" }}>High</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                active
                  ? "text-white shadow-lg shadow-purple-500/10"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
              style={active ? { background: "var(--accent)" } : {}}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl text-xl shadow-inner bg-purple-100 dark:bg-purple-900/30">
            {avatar || "👤"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate dark:text-white">
              {user?.email}
            </p>
            <p className="text-[10px] uppercase font-black text-gray-400">
              {profile?.role || "User"}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
        >
          {icons.logout} SAIR
        </button>
      </div>
    </aside>
  );
}
