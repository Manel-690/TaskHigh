import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessMode, setAccessMode] = useState("user");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Conta criada com sucesso!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Toaster />

      <div className="w-full max-w-lg bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">
          Criar conta
        </h1>

        <p className="text-sm text-center text-gray-400 mb-6">
          Registre seu acesso ao sistema
        </p>

        {/* MODO */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setAccessMode("user")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
              accessMode === "user"
                ? "text-white"
                : "text-gray-500 bg-gray-100 dark:bg-gray-800"
            }`}
            style={accessMode === "user" ? { background: "var(--accent)" } : {}}
          >
            Usuário
          </button>

          <button
            onClick={() => setAccessMode("admin")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
              accessMode === "admin"
                ? "text-white"
                : "text-gray-500 bg-gray-100 dark:bg-gray-800"
            }`}
            style={
              accessMode === "admin" ? { background: "var(--accent)" } : {}
            }
          >
            Administrador
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mb-4">
          O tipo de acesso será definido pela empresa.
        </p>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium text-sm"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center text-gray-400 mt-6">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
