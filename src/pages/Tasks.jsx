import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import TaskModal from "../components/TaskModal";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Toaster, toast } from "react-hot-toast";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = tasks.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (priority !== "all" && t.priority !== priority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // =========================
  // SAVE (CREATE + UPDATE)
  // =========================
  const handleSave = async (form) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // =========================
      // ✏️ EDIT
      // =========================
      if (editing) {
        const oldTask = editing;

        const { error } = await supabase
          .from("tasks")
          .update({
            ...form,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);

        if (error) throw error;

        // 🔥 HISTÓRICO
        const { error: historyError } = await supabase
          .from("task_history")
          .insert([
            {
              task_id: editing.id,
              user_id: user.id,
              action: "updated",
              title: form.title,
              old_value: oldTask,
              new_value: form,
            },
          ]);

        if (historyError) {
          console.error("❌ ERRO HISTORY:", historyError);
        } else {
          console.log("✅ HISTORY SALVO (UPDATE)");
        }

        toast.success("Tarefa atualizada!");
      }

      // =========================
      // 🆕 CREATE
      // =========================
      else {
        const { data, error } = await supabase
          .from("tasks")
          .insert([
            {
              title: form.title,
              description: form.description,
              status: form.status,
              priority: form.priority,
              due_date: form.due_date || null,
              created_by: user.id,
              assigned_to: user.id,
            },
          ])
          .select();

        if (error || !data || data.length === 0) {
          console.error("❌ ERRO AO CRIAR TASK:", error);
          toast.error("Erro ao criar tarefa");
          return;
        }

        const newTask = data[0];

        console.log("🔥 TASK CRIADA:", newTask);

        // 🔥 HISTÓRICO
        const { error: historyError } = await supabase
          .from("task_history")
          .insert([
            {
              task_id: newTask.id,
              user_id: user.id,
              action: "created",
              title: newTask.title,
              new_value: newTask,
            },
          ]);

        if (historyError) {
          console.error("❌ ERRO HISTORY:", historyError);
        } else {
          console.log("✅ HISTORY SALVO (CREATE)");
        }

        toast.success("Tarefa criada!");
      }

      setEditing(null);
      fetchTasks();
    } catch (e) {
      console.error("💥 ERRO REAL:", e);
      toast.error(e.message || "Erro ao salvar tarefa");
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (task) => {
    try {
      setDeleting(task.id);

      const { error: historyError } = await supabase
        .from("task_history")
        .insert([
          {
            task_id: task.id,
            user_id: user.id,
            action: "deleted",
            title: task.title,
            old_value: task,
          },
        ]);

      if (historyError) {
        console.error("❌ ERRO HISTORY:", historyError);
      } else {
        console.log("✅ HISTORY SALVO (DELETE)");
      }

      const { error } = await supabase.from("tasks").delete().eq("id", task.id);

      if (error) throw error;

      toast.success("Tarefa excluída.");
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir tarefa.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Toaster position="top-right" />

      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Minhas tarefas
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length} tarefas encontradas
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            + Nova tarefa
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400">{task.description}</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />

                    <button
                      onClick={() => {
                        setEditing(task);
                        setModalOpen(true);
                      }}
                      className="text-xs text-blue-500"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(task)}
                      className="text-xs text-red-500"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
