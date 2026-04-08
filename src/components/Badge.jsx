export const statusConfig = {
  pending:    { label: "Pendente",     bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-400" },
  in_progress:{ label: "Em andamento", bg: "bg-blue-100 dark:bg-blue-900/30",    text: "text-blue-700 dark:text-blue-400",     dot: "bg-blue-400" },
  done:       { label: "Concluída",    bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-400" },
  cancelled:  { label: "Cancelada",   bg: "bg-gray-100 dark:bg-gray-800",        text: "text-gray-500 dark:text-gray-400",     dot: "bg-gray-400" },
};

export const priorityConfig = {
  low:    { label: "Baixa",  bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-500 dark:text-gray-400" },
  medium: { label: "Média",  bg: "bg-orange-100 dark:bg-orange-900/30",  text: "text-orange-600 dark:text-orange-400" },
  high:   { label: "Alta",   bg: "bg-red-100 dark:bg-red-900/30",        text: "text-red-600 dark:text-red-400" },
};

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
