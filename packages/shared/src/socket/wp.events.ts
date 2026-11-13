import { AddRequestSchema, WorkingPermitResponse } from "../schemas";
import { WorkingPermitSocketPayload } from "../types/working-permit.types";


export interface WPServerToClientEvents {
    "wp:created": (wp: WorkingPermitSocketPayload) => void;
    "wp:updated": (wp: WorkingPermitSocketPayload) => void;
}