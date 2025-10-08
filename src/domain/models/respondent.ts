import { ParticipantRole } from "../constants/roles";

export interface Respondent {
  id: string;
  name?: string;
  email?: string;
  role: ParticipantRole;
  organization?: string;
}

export interface RespondentInvite {
  token: string;
  surveyId: string;
  respondentId?: string;
  expiresAt: string;
  status: "pending" | "sent" | "accepted" | "expired" | "completed";
}
