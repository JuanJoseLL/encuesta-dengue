export const PARTICIPANT_ROLES = [
  "epidemiologist",
  "entomologist",
  "biologist",
  "public-health",
  "policy-maker",
  "other",
] as const;

export type ParticipantRole = typeof PARTICIPANT_ROLES[number];

export const PARTICIPANT_ROLE_LABELS: Record<ParticipantRole, string> = {
  epidemiologist: "Epidemiólogo/a",
  entomologist: "Entomólogo/a",
  biologist: "Biólogo/a",
  "public-health": "Salud pública",
  "policy-maker": "Gestor/a sanitario",
  other: "Otro",
};
