import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";

export default function AdminPanel() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("admin_requests")
      .select("*")
      .eq("status", "pending");
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approve = async (req) => {
    await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", req.user_id);

    await supabase
      .from("admin_requests")
      .update({ status: "approved" })
      .eq("id", req.id);

    toast.success("Aprovado!");
    fetchRequests();
  };

  const reject = async (req) => {
    await supabase
      .from("admin_requests")
      .update({ status: "rejected" })
      .eq("id", req.id);

    toast("Rejeitado");
    fetchRequests();
  };

  // Se não for admin, mostra apenas a mensagem centralizada
  if (profile?.role !== "admin") {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 font-bold text-xl">
        Sem acesso
      </div>
    );
  }

  // 👇 Retorno limpo, indo direto para o conteúdo da página!
  return (
    <div className="space-y-6">
      <Toaster />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Painel de Administração
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie solicitações de permissão.
        </p>
      </div>

      {requests.length === 0 && (
        <p className="text-gray-400 text-center py-10">
          Nenhuma solicitação pendente.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl border bg-white dark:bg-[#0f1117] border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <p className="text-sm font-bold text-gray-400 mb-1">
              ID do Usuário
            </p>
            <p className="text-gray-900 dark:text-white font-mono text-sm truncate mb-4">
              {r.user_id}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => approve(r)}
                className="flex-1 py-2 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Aprovar
              </button>

              <button
                onClick={() => reject(r)}
                className="flex-1 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold text-sm transition-colors"
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
