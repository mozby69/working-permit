// src/socket/emitters/user.emitteikr.ts


import { getIO } from "@/socket";
import type { AddRequestSchema, User, WorkingPermitResponse, WorkingPermitSocketPayload } from "@repo/shared";

export function emitWPCreated(
  payload: WorkingPermitSocketPayload
): void {
  getIO().emit("wp:created", payload);
}

export function emitWPUpdated(
  payload: WorkingPermitSocketPayload
): void {
  getIO().emit("wp:updated", payload);
}
