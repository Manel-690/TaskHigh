import { supabase } from "./supabase";

export async function logHistory({
  task_id,
  user_id,
  action,
  old_value = null,
  new_value = null,
}) {
  console.log("🔥 CHAMOU HISTORY:", {
    task_id,
    user_id,
    action,
  });

  if (!task_id || !user_id || !action) {
    console.error("❌ DADOS INVÁLIDOS");
    return;
  }

  const { data, error } = await supabase
    .from("task_history")
    .insert([
      {
        task_id,
        user_id,
        action,
        old_value,
        new_value,
      },
    ])
    .select();

  if (error) {
    console.error("❌ ERRO AO SALVAR HISTORY:", error);
  } else {
    console.log("✅ HISTÓRICO SALVO:", data);
  }
}
