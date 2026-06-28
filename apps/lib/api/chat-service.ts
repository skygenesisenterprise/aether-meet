import { getMockModeEnabled } from "@/lib/api/config";
import { listConversations, createConversation as apiCreateConversation } from "@/lib/api/conversations";
import { listMessages, createMessage as apiCreateMessage, updateMessage as apiUpdateMessage } from "@/lib/api/messages";
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

function buildInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isGenericConversationName(name: string | undefined, type: string): boolean {
  if (!name) return true;

  const normalized = name.trim().toLowerCase();
  if (normalized === `conversation ${type}` || normalized === `conversations ${type}`) {
    return true;
  }

  if (type !== "dm") {
    return false;
  }

  if (looksLikeOpaqueIdentifier(name)) {
    return true;
  }

  return ["conversation privee", "conversation privée", "conversation prive", "conversation privé"].includes(normalized);
}

function looksLikeOpaqueIdentifier(value: string | undefined): boolean {
  if (!value) return false;

  const normalized = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized);
}

function getMemberDisplayName(member: { displayName?: string; email?: string; userId: string; role?: string } | undefined): string | null {
  if (!member) return null;

  const displayName = member.displayName?.trim();
  if (displayName && !looksLikeOpaqueIdentifier(displayName)) {
    return displayName;
  }

  const email = member.email?.trim();
  if (email) {
    return email.split("@")[0] || email;
  }

  if (member.role === "owner" || member.role === "admin") {
    return "Admin";
  }

  return null;
}

function resolveConversationName(
  conv: {
    type: string;
    name?: string;
    memberIds?: string[];
    participants?: Array<{ userId: string; displayName: string; email: string; role: string }>;
  },
  currentUser: User,
  members: Array<{ displayName?: string; email?: string; userId: string; role?: string }>
): string {
  if (conv.type !== "dm" || !isGenericConversationName(conv.name, conv.type)) {
    return conv.name?.trim() || `Conversation ${conv.type}`;
  }

  const otherParticipant = conv.participants?.find((participant) => participant.userId !== currentUser.id);
  if (otherParticipant) {
    return (
      getMemberDisplayName({
        userId: otherParticipant.userId,
        displayName: otherParticipant.displayName,
        email: otherParticipant.email,
        role: otherParticipant.role,
      }) ?? "Contact"
    );
  }

  const memberById = new Map(members.map((member) => [member.userId, member]));
  const otherMemberId = conv.memberIds?.find((memberId) => memberId !== currentUser.id);
  if (otherMemberId) {
    return getMemberDisplayName(memberById.get(otherMemberId)) ?? "Contact";
  }

  return currentUser.displayName?.trim() || currentUser.email || "Conversation privée";
}

function toUIMessage(
  msg: { id: string; authorId: string; content: string; createdAt: string; editedAt?: string },
  users: Array<{ id: string; displayName: string }>
): ChatMessage {
  const author = users.find((u) => u.id === msg.authorId);
  const time = new Date(msg.createdAt);
  return {
    id: msg.id,
    authorId: msg.authorId,
    author: author?.displayName ?? "Inconnu",
    initials: buildInitials(author?.displayName ?? "?"),
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(time),
    content: msg.content,
    editedAt: msg.editedAt,
  };
}

function toUIAuthorName(userId: string, users: Array<{ id: string; displayName: string }>): string {
  return users.find((u) => u.id === userId)?.displayName ?? "Inconnu";
}

function formatMessageTime(createdAt: string): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(createdAt));
}

export function summarizeMessageContent(content: string): string {
  const attachments = Array.from(content.matchAll(/\[(Image|Fichier):\s*(.*?)\]/g)).map((match) => ({
    kind: match[1] === "Image" ? "image" : "file",
    name: match[2]?.trim() ?? "",
  }));
  const text = content.replace(/\[(Image|Fichier):\s*(.*?)\]/g, "").replace(/\s+/g, " ").trim();

  if (text) {
    return text;
  }

  if (attachments.length === 0) {
    return "";
  }

  if (attachments.length === 1) {
    const attachment = attachments[0];
    return attachment.name || (attachment.kind === "image" ? "1 image" : "1 fichier");
  }

  const imageCount = attachments.filter((attachment) => attachment.kind === "image").length;
  const fileCount = attachments.length - imageCount;
  if (imageCount > 0 && fileCount > 0) {
    return `${attachments.length} pièces jointes`;
  }

  return imageCount > 0 ? `${imageCount} images` : `${fileCount} fichiers`;
}

function formatConversationPreview(
  message: { authorId: string; content: string } | undefined,
  currentUser: User,
  users: Array<{ userId: string; displayName?: string }>
): string {
  if (!message) {
    return "Aucun message pour le moment.";
  }

  const authorName =
    message.authorId === currentUser.id
      ? "Vous"
      : users.find((user) => user.userId === message.authorId)?.displayName ?? "Inconnu";
  const content = summarizeMessageContent(message.content);

  return content ? `${authorName} : ${content}` : `${authorName} a envoyé un message.`;
}

function getConversationMemberIds(conv: {
  createdBy?: string;
  memberIds?: string[];
  participants?: Array<{ userId: string }>;
}): string[] {
  const ids = conv.memberIds?.length
    ? conv.memberIds
    : conv.participants?.map((participant) => participant.userId) ?? [];

  if (ids.length > 0) {
    return Array.from(new Set(ids.filter(Boolean)));
  }

  return conv.createdBy ? [conv.createdBy] : [];
}

function isConversationForCurrentUser(
  conv: {
    type?: string;
    createdBy?: string;
    memberIds?: string[];
    participants?: Array<{ userId: string }>;
  },
  currentUser: User
): boolean {
  if (conv.type === "dm") {
    return getConversationMemberIds(conv).some((memberId) => memberId !== currentUser.id);
  }

  if (conv.createdBy === currentUser.id) {
    return true;
  }

  return getConversationMemberIds(conv).includes(currentUser.id);
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
    listWorkspaceMembers(deps.workspaceId).catch(() => [] as Array<{ userId: string; displayName?: string; email?: string; role?: string }>),
  ]);

  const visibleConversations = apiConversations.filter((conv) => isConversationForCurrentUser(conv, deps.currentUser));
  const latestMessages = await Promise.all(
    visibleConversations.map((conv) =>
      listMessages(conv.id, { limit: 1 })
        .then((response) => response.data[0])
        .catch(() => undefined)
    )
  );

  return visibleConversations.map((conv, index) => {
    const name = resolveConversationName(conv, deps.currentUser, members);
    const initials = buildInitials(name);
    const memberIds = getConversationMemberIds(conv);
    const latestMessage = latestMessages[index];

    return {
      id: conv.id,
      name,
      initials: initials || "??",
      type: conv.type === "dm" ? "dm" : "channel",
      memberIds,
      subtitle: conv.type === "dm" ? "Conversation privée" : "Canal",
      preview: formatConversationPreview(latestMessage, deps.currentUser, members),
      time: latestMessage ? formatMessageTime(latestMessage.createdAt) : formatMessageTime(conv.createdAt),
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

  const users = members.map((member) => ({ id: member.userId, displayName: member.displayName }));
  return apiMessages.data.map((msg) => toUIMessage(msg, users));
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

  const members = await listWorkspaceMembers(deps.workspaceId).catch(
    () => [] as Array<{ userId: string; displayName?: string; email?: string; role?: string }>
  );
  const fallbackCurrentUser = deps.currentUser ?? ({
    id: "",
    email: "",
    displayName: "",
  } as User);
  const name = resolveConversationName(created, fallbackCurrentUser, members);
  const initials = buildInitials(name);

  return {
    id: created.id,
    name,
    initials: initials || "??",
    type: created.type === "dm" ? "dm" : "channel",
    memberIds: getConversationMemberIds(created),
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

export async function updateMessage(
  messageId: string,
  content: string,
  deps: ChatServiceDeps
): Promise<ChatMessage | null> {
  if (getMockModeEnabled()) {
    return null;
  }

  if (!deps.currentUser) {
    return null;
  }

  const updated = await apiUpdateMessage(messageId, { content });

  return toUIMessage(updated, [{ id: deps.currentUser.id, displayName: deps.currentUser.displayName }]);
}

export async function getMembers(deps: ChatServiceDeps): Promise<Array<{ id: string; displayName: string }>> {
  if (getMockModeEnabled()) {
    return people.map((p) => ({ id: p.id, displayName: p.name }));
  }

  if (!deps.workspaceId) {
    return [];
  }

  const members = await listWorkspaceMembers(deps.workspaceId).catch(() => []);
  return members.map((member) => ({
    id: member.userId,
    displayName: member.displayName || member.email || member.userId,
  }));
}
