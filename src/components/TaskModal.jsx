import { useState, useEffect } from "react";

const STATUSES = ["pending", "in_progress", "done", "cancelled"];
const PRIORITIES = ["low", "medium", "high"];
const statusLabels = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída", cancelled: "Cancelada" };
const priorityLabels = { low: "Baixa", medium: "Média", high: "Alta" };

export default function TaskModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ title: "", description: "", status: "pending", priority: "medium", due_date: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { title: initial.title || "", description: initial.description || "", status: initial.status || "pending", priority: initial.priority || "medium", due_date: initial.due_date ? initial.due_date.slice(0,10) : "" }
        : { title: "", description: "", status: "pending", priority: "medium", due_date: "" }
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{initial ? "Editar tarefa" : "Nova tarefa"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Título *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="Descreva a tarefa brevemente..." className={inputCls}
              style={{"--tw-ring-color":"var(--accent)"}} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Descrição</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="Detalhes, contexto, links..." className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className={inputCls}>
                {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Prioridade</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))} className={inputCls}>
                {PRIORITIES.map(p => <option key={p} value={p}>{priorityLabels[p]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Prazo</label>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} className={inputCls} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{background:"var(--accent)"}}>
              {saving ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Salvando...</> : (initial ? "Salvar" : "Criar tarefa")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
