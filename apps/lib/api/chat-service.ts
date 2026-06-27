import { getMockModeEnabled } from "@/lib/api/config";
import { listConversations, createConversation as apiCreateConversation } from "@/lib/api/conversations";
import { listMessages, createMessage as apiCreateMessage } from "@/lib/api/messages";
import { listWorkspaceMembers } from "@/lib/api/members";
import {
  conversations as mockConversations,
  conversationMessages as mockMessages,
  people,
  currentUser as mockCurrentUser,
  type ChatMessage,
  type Conversation,
} from "@/lib/platform-data";
import type { User } from "@/lib/api/types";

export interface ChatServiceDeps {
  workspaceId: string | null;
  currentUser: User | null;
}

function toUIMessage(msg: { id: string; authorId: string; content: string; createdAt: string }, users: Array<{ id: string; displayName: string }>): ChatMessage {
  const author = users.find((u) => u.id === msg.authorId);
  const time = new Date(msg.createdAt);
  return {
    id: msg.id,
    authorId: msg.authorId,
    author: author?.displayName ?? "Inconnu",
    initials: (author?.displayName ?? "?")
      .split(" ")
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2),
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(time),
    content: msg.content,
  };
}

function toUIAuthorName(userId: string, users: Array<{ id: string; displayName: string }>): string {
  return users.find((u) => u.id === userId)?.displayName ?? "Inconnu";
}

export async function getConversations(deps: ChatServiceDeps): Promise<Conversation[]> {
  if (getMockModeEnabled()) {
    return mockConversations;
  }

  if (!deps.workspaceId || !deps.currentUser) {
    return [];
  }

  const [apiConversations, members] = await Promise.all([
    listConversations(deps.workspaceId),
    listWorkspaceMembers(deps.workspaceId).catch(() => [] as Array<{ userId: string }>),
  ]);

  const memberUserIds = members.map((m) => m.userId);

  return apiConversations.map((conv) => {
    const name = conv.name ?? `Conversation ${conv.type}`;
    const initials = name
      .split(" ")
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      id: conv.id,
      name,
      initials: initials || "??",
      type: conv.type === "dm" ? "dm" : "channel",
      memberIds: memberUserIds,
      subtitle: conv.type === "dm" ? "Conversation privée" : "Canal",
      preview: "",
      time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(conv.createdAt)),
      status: "online" as const,
    };
  });
}

export async function getMessages(conversationId: string, deps: ChatServiceDeps): Promise<ChatMessage[]> {
  if (getMockModeEnabled()) {
    return mockMessages[conversationId] ?? [];
  }

  if (!deps.workspaceId || !deps.currentUser) {
    return [];
  }

  const [apiMessages, members] = await Promise.all([
    listMessages(conversationId),
    listWorkspaceMembers(deps.workspaceId).catch(() => [] as Array<{ userId: string; displayName: string }>),
  ]);

  return apiMessages.data.map((msg) => toUIMessage(msg, members));
}

export async function createConversation(
  deps: ChatServiceDeps,
  input: { type: "dm" | "channel"; name?: string; memberIds: string[] }
): Promise<Conversation | null> {
  if (getMockModeEnabled()) {
    return null;
  }

  if (!deps.workspaceId) {
    return null;
  }

  const created = await apiCreateConversation(deps.workspaceId, {
    type: input.type,
    name: input.name,
    memberIds: input.memberIds,
  });

  const name = created.name ?? `Conversation ${created.type}`;
  const initials = name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: created.id,
    name,
    initials: initials || "??",
    type: created.type === "dm" ? "dm" : "channel",
    memberIds: input.memberIds,
    subtitle: created.type === "dm" ? "Conversation privée" : "Canal",
    preview: "Conversation créée.",
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    status: "online" as const,
  };
}

export async function sendMessage(
  conversationId: string,
  content: string,
  deps: ChatServiceDeps
): Promise<ChatMessage | null> {
  if (getMockModeEnabled()) {
    return null;
  }

  if (!deps.currentUser) {
    return null;
  }

  const created = await apiCreateMessage(conversationId, { type: "text", content });

  return toUIMessage(created, [{ id: deps.currentUser.id, displayName: deps.currentUser.displayName }]);
}

export async function getMembers(deps: ChatServiceDeps): Promise<Array<{ id: string; displayName: string }>> {
  if (getMockModeEnabled()) {
    return people.map((p) => ({ id: p.id, displayName: p.name }));
  }

  if (!deps.workspaceId) {
    return [];
  }

  return listWorkspaceMembers(deps.workspaceId).catch(() => []);
}
