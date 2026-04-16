import { useState, useEffect, useCallback } from "react";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import TaskModal from "../components/TaskModal";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import jsPDF from "jspdf";

export default function Tasks() {
  const { user, profile } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // 🔥 prioridade automática
  const getAutoPriority = (due_date) => {
    if (!due_date) return "low";
    const diff = new Date(due_date) - new Date();
    if (diff < 86400000) return "high";
    if (diff < 259200000) return "medium";
    return "low";
  };

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. Pega os IDs de todos os administradores do sistema
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    const adminIds = adminProfiles ? adminProfiles.map((p) => p.id) : [];

    // 2. Junta o seu ID com os IDs dos admins
    const allowedIds = [...new Set([...adminIds, user.id])];

    // 3. Busca tarefas criadas por qualquer um dessa lista
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .in("created_by", allowedIds)
      .order("created_at", { ascending: false });

    setTasks(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 🔔 notificações
  useEffect(() => {
    const now = new Date();
    tasks.forEach((task) => {
      if (!task.due_date) return;
      const diff = new Date(task.due_date) - now;
      if (diff > 0 && diff < 3600000) {
        toast("⏰ Tarefa próxima: " + task.title);
      }
      if (diff < 0 && task.status !== "done") {
        toast.error("⚠️ Atrasada: " + task.title);
      }
    });
  }, [tasks]);

  // 💾 salvar (ADMIN ONLY)
  const handleSave = async (form) => {
    if (!user) return;
    if (profile?.role !== "admin") {
      toast.error("Você não tem permissão");
      return;
    }

    if (editing) {
      await supabase
        .from("tasks")
        .update({
          ...form,
          updated_at: new Date(),
        })
        .eq("id", editing.id);
      toast.success("Atualizada!");
    } else {
      await supabase.from("tasks").insert([
        {
          ...form,
          priority: form.priority || getAutoPriority(form.due_date),
          created_by: user.id,
        },
      ]);
      toast.success("Criada!");
    }

    setModalOpen(false);
    setEditing(null);
    fetchTasks();
  };

  // ✅ concluir (liberado pra todos)
  const handleDone = async (task) => {
    await supabase.from("tasks").update({ status: "done" }).eq("id", task.id);
    toast.success("Concluída!");
    fetchTasks();
  };

  // ❌ deletar (ADMIN ONLY)
  const handleDelete = async (task) => {
    if (profile?.role !== "admin") {
      toast.error("Você não tem permissão");
      return;
    }
    await supabase.from("tasks").delete().eq("id", task.id);
    toast.success("Excluída!");
    fetchTasks();
  };

  // ✏️ editar (ADMIN ONLY)
  const handleEdit = (task) => {
    if (profile?.role !== "admin") {
      toast.error("Você não tem permissão");
      return;
    }
    setEditing(task);
    setModalOpen(true);
  };

  // 📄 exportar PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Tarefas", 10, 10);
    tasks.forEach((t, i) => {
      doc.text(`${i + 1}. ${t.title} - ${t.status}`, 10, 20 + i * 10);
    });
    doc.save("tarefas.pdf");
  };

  return (
    <div className="space-y-6">
      <Toaster />

      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tarefas
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>
            {profile?.role === "admin" ? "Modo Administrador" : "Modo Usuário"}
          </p>
        </div>

        <div className="flex gap-2">
          {/* 🔥 só admin vê */}
          {profile?.role === "admin" && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              + Nova
            </button>
          )}

          <button
            onClick={exportPDF}
            className="px-4 py-2 font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white rounded-xl text-sm transition-colors"
          >
            Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          Nenhuma tarefa encontrada.
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 bg-white dark:bg-[#0f1117] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {task.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />

                <div className="flex gap-2 ml-2">
                  {/* concluir */}
                  {task.status !== "done" && (
                    <button
                      onClick={() => handleDone(task)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                      title="Concluir"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}

                  {/* editar */}
                  {profile?.role === "admin" && (
                    <button
                      onClick={() => handleEdit(task)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Editar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                      </svg>
                    </button>
                  )}

                  {/* deletar */}
                  {profile?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(task)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Excluir"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
