import { apiListRequest, apiRequest } from "@/lib/api/client";
import { assertPublicLiveKitUrl } from "@/lib/api/config";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import type { JoinTokenResponse, Meeting, MeetingJoinCredentials, MeetingParticipant, MeetingSession } from "@/lib/api/types";

export interface CreateMeetingInput {
  title: string;
  conversationId?: string;
}

export interface AddMeetingParticipantInput {
  userId: string;
  role?: string;
}

export interface MeetingStartPayload {
  meeting: Meeting;
  session: MeetingSession;
}

function normalizeJoinCredentials(payload: JoinTokenResponse): MeetingJoinCredentials {
  return {
    meetingId: payload.meetingId,
    sessionId: payload.sessionId,
    roomName: payload.roomName,
    participantIdentity: payload.participantIdentity,
    token: payload.token,
    signalingUrl: assertPublicLiveKitUrl(payload.signalingUrl),
    expiresAt: payload.expiresAt,
    iceServers: payload.iceServers,
  };
}

export async function listMeetings(workspaceId: string): Promise<Meeting[]> {
  const response = await apiListRequest<Meeting>(`/workspaces/${workspaceId}/meetings`);
  return response.data;
}

export function createMeeting(
  workspaceId: string,
  input: CreateMeetingInput,
  idempotencyKey = createIdempotencyKey("meeting")
): Promise<Meeting> {
  return apiRequest<Meeting, CreateMeetingInput>(`/workspaces/${workspaceId}/meetings`, {
    method: "POST",
    body: input,
    idempotencyKey,
  });
}

export function getMeeting(meetingId: string): Promise<Meeting> {
  return apiRequest<Meeting>(`/meetings/${meetingId}`);
}

export function startMeeting(
  meetingId: string,
  idempotencyKey = createIdempotencyKey("meeting-start")
): Promise<MeetingStartPayload> {
  return apiRequest<MeetingStartPayload>(`/meetings/${meetingId}/start`, {
    method: "POST",
    idempotencyKey,
  });
}

export function endMeeting(meetingId: string): Promise<MeetingStartPayload> {
  return apiRequest<MeetingStartPayload>(`/meetings/${meetingId}/end`, {
    method: "POST",
  });
}

export function cancelMeeting(meetingId: string): Promise<Meeting> {
  return apiRequest<Meeting>(`/meetings/${meetingId}/cancel`, {
    method: "POST",
  });
}

export async function listMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
  const response = await apiListRequest<MeetingParticipant>(`/meetings/${meetingId}/participants`);
  return response.data;
}

export function addMeetingParticipant(
  meetingId: string,
  input: AddMeetingParticipantInput
): Promise<MeetingParticipant> {
  return apiRequest<MeetingParticipant, AddMeetingParticipantInput>(`/meetings/${meetingId}/participants`, {
    method: "POST",
    body: input,
  });
}

export async function createMeetingJoinToken(meetingId: string): Promise<MeetingJoinCredentials> {
  const payload = await apiRequest<JoinTokenResponse>(`/meetings/${meetingId}/join-token`, {
    method: "POST",
  });

  return normalizeJoinCredentials(payload);
}
