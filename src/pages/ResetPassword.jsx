import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Email enviado!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleReset} className="space-y-4 w-80">
        <h1 className="text-xl font-bold">Recuperar senha</h1>

        <p>{msg}</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-yellow-500 text-white p-2">
          Enviar email
        </button>

        <Link to="/">Voltar</Link>
      </form>
    </div>
  );
}
