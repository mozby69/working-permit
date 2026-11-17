import { User } from "../authentication/user.types";

export interface WorkingType {
  id: number;
  workerName: string;
  firstApproverUserId: number | null;
  finalApproverUserId: number | null;

  firstApproverUser?: User | null;
  finalApproverUser?: User | null;

  createdAt: string;
}