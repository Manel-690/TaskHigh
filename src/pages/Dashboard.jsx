import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    in_progress: 0,
    overdue: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // 1. Pega os IDs de todos os administradores
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    const adminIds = adminProfiles ? adminProfiles.map((p) => p.id) : [];
    const allowedIds = [...new Set([...adminIds, user.id])];

    // 2. Busca as tarefas criadas por você ou por qualquer admin
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .in("created_by", allowedIds);

    const tasksData = data || [];
    const now = new Date();
    setStats({
      total: tasksData.length,
      done: tasksData.filter((t) => t.status === "done").length,
      in_progress: tasksData.filter((t) => t.status === "in_progress").length,
      overdue: tasksData.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done",
      ).length,
    });
    setRecent(
      [...tasksData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    );
    setLoading(false);
  };

  const pct =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-3xl font-black dark:text-white">
          Olá, {user?.email?.split("@")[0]} 👋
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Aqui está o resumo das suas tarefas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total" value={stats.total} icon="📋" />
        <Card label="Concluídas" value={stats.done} icon="✅" />
        <Card label="Em andamento" value={stats.in_progress} icon="⏳" />
        <Card label="Atrasadas" value={stats.overdue} icon="🚨" />
      </div>

      <div className="bg-white dark:bg-[#0f1117] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Progresso Geral
          </span>
          <span
            className="text-2xl font-black"
            style={{ color: "var(--accent)" }}
          >
            {pct}%
          </span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: "var(--accent)" }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f1117] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="flex justify-between p-6 border-b border-gray-50 dark:border-gray-800">
          <h2 className="font-bold dark:text-white">Tarefas Recentes</h2>
          <Link
            to="/tasks"
            className="text-sm font-bold hover:opacity-70 transition-opacity"
            style={{ color: "var(--accent)" }}
          >
            Ver todas
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {recent.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-gray-200">
                {task.title || "Sem título"}
              </p>
              <div className="flex items-center gap-3">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
          ))}
          {recent.length === 0 && !loading && (
            <p className="p-10 text-center text-gray-400">
              Nenhuma tarefa encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-[#0f1117] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm card-hover">
      <div className="flex justify-between items-start mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-4xl font-black text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">
        {label}
      </p>
    </div>
  );
}
