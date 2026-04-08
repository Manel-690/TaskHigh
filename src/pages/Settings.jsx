import Sidebar from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Toaster, toast } from "react-hot-toast";

export default function Settings() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const { user } = useAuth();

  const accentOptions = {
    purple: { name: "Roxo", class: "bg-violet-500" },
    blue: { name: "Azul", class: "bg-blue-500" },
    green: { name: "Verde", class: "bg-emerald-500" },
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <Sidebar />
      <Toaster position="top-right" />

      <main className="flex-1 p-8 overflow-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Personalize sua experiência na plataforma
          </p>
        </div>

        <div className="space-y-5">
          {/* Profile */}
          <div className="glass card-hover rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Perfil
            </h2>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold uppercase shadow"
                style={{ background: "var(--accent)" }}
              >
                {user?.email?.[0] || "U"}
              </div>

              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="glass card-hover rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-5">
              Aparência
            </h2>

            {/* Toggle iOS */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Modo escuro
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Alterna entre tema claro e escuro
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-[var(--accent)] shadow-lg"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                    theme === "dark" ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Accent */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Cor de destaque
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Afeta botões e destaques
              </p>

              <div className="flex gap-3">
                {Object.entries(accentOptions).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAccent(key);
                      toast.success(`Cor alterada para ${val.name}`);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                      accent === key
                        ? "border-[var(--accent)] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white scale-105"
                        : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:scale-105"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${val.class}`} />
                    {val.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="glass card-hover rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Sobre o TaskHigh
            </h2>

            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Versão</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  1.0.0
                </span>
              </div>

              <div className="flex justify-between">
                <span>Stack</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  React + Vite + Supabase
                </span>
              </div>

              <div className="flex justify-between">
                <span>UI</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Tailwind CSS
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
