import { apiListRequest, apiRequest } from "@/lib/api/client";
import type { CallHistoryItem, PaginatedResponse, Voicemail } from "@/lib/api/types";

export interface CallFilters {
  [key: string]: string | number | boolean | undefined;
}

function buildSearchParams(values?: CallFilters): string {
  const params = new URLSearchParams();
  Object.entries(values ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  return params.size > 0 ? `?${params.toString()}` : "";
}

export function listCallHistory(workspaceId: string, filters?: CallFilters): Promise<PaginatedResponse<CallHistoryItem>> {
  return apiListRequest<CallHistoryItem>(`/workspaces/${workspaceId}/calls/history${buildSearchParams(filters)}`);
}

export function getCall(callId: string): Promise<CallHistoryItem> {
  return apiRequest<CallHistoryItem>(`/calls/${callId}`);
}

export function getVoicemail(callId: string): Promise<Voicemail> {
  return apiRequest<Voicemail>(`/calls/${callId}/voicemail`);
}
