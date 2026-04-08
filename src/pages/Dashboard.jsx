import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Toaster, toast } from "react-hot-toast";

const StatCard = ({ label, value, icon, colorClass, sub }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${colorClass}`}>{icon}</span>
    </div>
    <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const taskIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;
const checkIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>;
const clockIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const alertIcon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z"/></svg>;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, done: 0, in_progress: 0, overdue: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: tasks } = await supabase.from("tasks").select("*").eq("created_by", user.id);
      if (!tasks) return;
      const now = new Date();
      const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== "done" && t.status !== "cancelled").length;
      setStats({
        total: tasks.length,
        done: tasks.filter(t => t.status === "done").length,
        in_progress: tasks.filter(t => t.status === "in_progress").length,
        overdue,
      });
      const sorted = [...tasks].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
      setRecent(sorted);
    } catch (e) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{ className: "dark:bg-gray-800 dark:text-white dark:border-gray-700" }} />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting()}, {user?.email?.split("@")[0]} 👋</h1>
          <p className="text-sm text-gray-400 mt-1">Aqui está um resumo das suas tarefas hoje.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Carregando dados...
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total de tarefas" value={stats.total} icon={taskIcon} colorClass="bg-violet-500" />
              <StatCard label="Concluídas" value={stats.done} icon={checkIcon} colorClass="bg-emerald-500" sub={`${pct}% do total`} />
              <StatCard label="Em andamento" value={stats.in_progress} icon={clockIcon} colorClass="bg-blue-500" />
              <StatCard label="Atrasadas" value={stats.overdue} icon={alertIcon} colorClass="bg-rose-500" />
            </div>

            {/* Progress bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Progresso geral</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{stats.done} de {stats.total} tarefas concluídas</p>
                </div>
                <span className="text-2xl font-black" style={{color:"var(--accent)"}}>{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background:"var(--accent)"}} />
              </div>
            </div>

            {/* Recent tasks */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Tarefas recentes</h2>
                <Link to="/tasks" className="text-xs font-medium transition-colors hover:underline" style={{color:"var(--accent)"}}>Ver todas →</Link>
              </div>
              {recent.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm text-gray-400">Nenhuma tarefa ainda.</p>
                  <Link to="/tasks" className="text-xs font-medium mt-1 inline-block hover:underline" style={{color:"var(--accent)"}}>Criar primeira tarefa</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recent.map(task => (
                    <Link key={task.id} to={`/tasks/${task.id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {task.due_date ? `Prazo: ${new Date(task.due_date).toLocaleDateString("pt-BR")}` : "Sem prazo definido"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
