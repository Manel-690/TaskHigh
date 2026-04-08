import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const [mode, setMode] = useState("login"); // login | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("E-mail ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setMsg("Conta criada! Verifique seu email.");
      setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setMsg("Email de recuperação enviado!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    if (mode === "login") return handleLogin(e);
    if (mode === "signup") return handleSignup(e);
    if (mode === "reset") return handleReset(e);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        {/* LOGO */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-xl"
            style={{ background: "var(--accent)" }}
          >
            T
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "login" && "Entrar"}
            {mode === "signup" && "Criar conta"}
            {mode === "reset" && "Recuperar senha"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">TaskHigh</p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

          {msg && <div className="text-green-500 text-sm mb-3">{msg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 outline-none"
            />

            {mode !== "reset" && (
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-xs"
                >
                  {showPass ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ background: "var(--accent)" }}
            >
              {submitting
                ? "Carregando..."
                : mode === "login"
                  ? "Entrar"
                  : mode === "signup"
                    ? "Criar conta"
                    : "Enviar email"}
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-4 text-xs text-center text-gray-400 space-y-2">
            {mode === "login" && (
              <>
                <p
                  onClick={() => setMode("reset")}
                  className="cursor-pointer hover:underline"
                >
                  Esqueci minha senha
                </p>
                <p
                  onClick={() => setMode("signup")}
                  className="cursor-pointer hover:underline"
                >
                  Criar conta
                </p>
              </>
            )}

            {mode !== "login" && (
              <p
                onClick={() => setMode("login")}
                className="cursor-pointer hover:underline"
              >
                Voltar para login
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
