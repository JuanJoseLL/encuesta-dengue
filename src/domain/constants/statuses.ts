export const SESSION_STATUSES = [
  "draft",
  "in-progress",
  "submitted",
  "closed",
] as const;

export type SessionStatus = typeof SESSION_STATUSES[number];

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  draft: "Borrador",
  "in-progress": "En progreso",
  submitted: "Enviado",
  closed: "Cerrado",
};
