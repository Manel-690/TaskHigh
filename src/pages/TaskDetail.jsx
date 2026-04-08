import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import TaskModal from "../components/TaskModal";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Toaster, toast } from "react-hot-toast";

const changeTypeLabel = { created: "Criada", updated: "Atualizada", status_changed: "Status alterado", deleted: "Excluída" };

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data: t } = await supabase.from("tasks").select("*").eq("id", id).single();
      const { data: h } = await supabase.from("task_history").select("*").eq("task_id", id).order("created_at", { ascending: false });
      setTask(t);
      setHistory(h || []);
    } catch { toast.error("Erro ao carregar tarefa."); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    const { error } = await supabase.from("tasks").update({ ...form, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    await supabase.from("task_history").insert({ task_id: id, changed_by: user.id, change_type: "updated", notes: `Status: ${form.status}` });
    toast.success("Tarefa atualizada!");
    fetchAll();
  };

  const handleDelete = async () => {
    if (!confirm("Deseja excluir esta tarefa?")) return;
    await supabase.from("task_history").delete().eq("task_id", id);
    await supabase.from("tasks").delete().eq("id", id);
    toast.success("Tarefa excluída.");
    navigate("/tasks");
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!task) return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Tarefa não encontrada.</p>
          <Link to="/tasks" className="text-sm font-medium" style={{color:"var(--accent)"}}>← Voltar</Link>
        </div>
      </div>
    </div>
  );

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Toaster position="top-right" />
      <TaskModal open={editing} onClose={() => setEditing(false)} onSave={handleSave} initial={task} />

      <main className="flex-1 p-8 overflow-auto max-w-4xl">
        {/* Back */}
        <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Voltar às tarefas
        </Link>

        {/* Task card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.due_date && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isOverdue ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                      {isOverdue ? "⚠ " : "📅 "}
                      {new Date(task.due_date).toLocaleDateString("pt-BR", { day:"2-digit", month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{background:"var(--accent)"}}>
                  Editar
                </button>
                <button onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all">
                  Excluir
                </button>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descrição</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Criada em</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(task.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
            {task.updated_at && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Atualizada em</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(task.updated_at).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Histórico de alterações</h2>
          </div>
          {history.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Nenhuma alteração registrada.</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {history.map(h => (
                <div key={h.id} className="flex items-start gap-3 px-6 py-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5 flex-shrink-0" style={{background:"var(--accent)"}}>
                    {(h.changed_by || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{changeTypeLabel[h.change_type] || h.change_type}</p>
                    {h.notes && <p className="text-xs text-gray-400 mt-0.5">{h.notes}</p>}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(h.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
