export type LeadType = "budget" | "meeting" | "contact";
export type LeadStatus = "new" | "viewed" | "replied" | "closed";

export interface Lead {
  id: string;
  ownerUid: string;
  type: LeadType;
  status: LeadStatus;
  payload: Record<string, unknown>;
  createdAt: Date;
}
