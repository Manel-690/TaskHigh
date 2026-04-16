import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast, Toaster } from "react-hot-toast";

export default function Profile() {
  const { user, profile } = useAuth();
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkRequest();
  }, [user]);

  // Verifica se o usuário já tem um pedido pendente
  const checkRequest = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("admin_requests")
      .select("status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) setRequestStatus(data.status);
  };

  // 🔥 NOVO: Fica checando se o admin já aprovou o usuário
  useEffect(() => {
    let interval;
    // Se está pendente, checa o banco a cada 3 segundos
    if (requestStatus === "pending" && profile?.role !== "admin") {
      interval = setInterval(async () => {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Se a role mudou pra admin lá no banco, recarrega a página!
        if (data?.role === "admin") {
          toast.success("Parabéns! Seu acesso Admin foi aprovado.");
          setTimeout(() => {
            window.location.reload(); // Recarrega para liberar os menus
          }, 2000);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [requestStatus, profile, user]);

  const handleRequestAdmin = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("admin_requests")
      .insert([{ user_id: user.id, status: "pending" }]);

    if (error) {
      toast.error("Erro ao enviar solicitação.");
      console.error(error);
    } else {
      toast.success("Solicitação enviada com sucesso!");
      setRequestStatus("pending");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Toaster />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Meu Perfil
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie suas informações e permissões de acesso.
        </p>
      </div>

      <div className="p-6 bg-white dark:bg-[#0f1117] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        {/* INFO DO USUÁRIO */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl shadow-inner">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.email}
            </h2>
            <span className="inline-block mt-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500 rounded-lg">
              {profile?.role === "admin" ? "Administrador" : "Usuário Padrão"}
            </span>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* ÁREA DE SOLICITAÇÃO ADMIN */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Permissões Avançadas
          </h3>

          {profile?.role === "admin" ? (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              ✅ Você já possui acesso total de Administrador.
            </p>
          ) : requestStatus === "pending" ? (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              ⏳ Sua solicitação para Administrador está em análise. Fique de
              olho nesta tela!
            </p>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Administradores podem criar tarefas globais (que todos os
                usuários veem), além de gerenciar outros usuários.
              </p>
              <button
                onClick={handleRequestAdmin}
                disabled={loading}
                className="px-4 py-2 text-white font-bold rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "Enviando..." : "Solicitar Acesso de Administrador"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
