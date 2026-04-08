import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH HISTORY
  // =========================
  const fetchHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("task_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("🔥 HISTORY DATA:", data);

      setHistory(data || []);
    } catch (e) {
      console.error("Erro ao buscar histórico:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // =========================
  // PEGAR TITULO DA TASK (🔥 AQUI ESTÁ O SEGREDO)
  // =========================
  const getTaskTitle = (item) => {
    try {
      if (item.new_value) {
        const parsed = JSON.parse(item.new_value);
        if (parsed?.title) return parsed.title;
      }

      if (item.old_value) {
        const parsed = JSON.parse(item.old_value);
        if (parsed?.title) return parsed.title;
      }

      return item.title || "Tarefa";
    } catch {
      return item.title || "Tarefa";
    }
  };

  // =========================
  // FORMAT ACTION
  // =========================
  const getActionLabel = (action) => {
    if (action === "created") return "Criada";
    if (action === "updated") return "Atualizada";
    if (action === "deleted") return "Excluída";
    return action;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Histórico de atividades
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          Registro de todas as alterações feitas nas suas tarefas.
        </p>

        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400">Nenhuma atividade encontrada.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    {/* 🔥 TEXTO FINAL DO JEITO QUE VOCÊ QUER */}
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getActionLabel(item.action)}{" "}
                      <span className="text-gray-400 mx-1">—</span>{" "}
                      {getTaskTitle(item)}
                    </p>
                  </div>

                  {/* ⏰ HORÁRIO */}
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
