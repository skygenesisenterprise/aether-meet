import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  conversationMessages,
  conversations,
  currentUser,
  people,
  type ChatMessage,
  type Conversation,
} from "@/lib/platform-data";

interface CreateConversationInput {
  type: "dm" | "channel";
  name?: string;
  memberIds: string[];
}

interface ChatState {
  activeConversationId: string | null;
  customConversations: Conversation[];
  customMessages: Record<string, ChatMessage[]>;
  setActiveConversation: (id: string | null) => void;
  createConversation: (input: CreateConversationInput) => string;
  sendMessage: (conversationId: string, content: string) => void;
}

function formatTime() {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function buildConversationInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildConversationStatus(memberIds: string[]) {
  return (
    people.find((person) => memberIds.includes(person.id) && person.id !== currentUser.id)?.status ?? "online"
  );
}

function buildConversationSubtitle(type: "dm" | "channel", memberIds: string[]) {
  const members = memberIds
    .map((memberId) => people.find((person) => person.id === memberId))
    .filter((member): member is (typeof people)[number] => Boolean(member));

  if (type === "dm") {
    return members.find((member) => member.id !== currentUser.id)?.role ?? "Conversation privée";
  }

  const onlineCount = members.filter((member) => member.status === "online").length;
  return `${members.length} membres · ${onlineCount} en ligne`;
}

const baseMessages = conversationMessages;
const baseConversations = conversations;

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      activeConversationId: null,
      customConversations: [],
      customMessages: {},
      setActiveConversation: (id) => set({ activeConversationId: id }),
      createConversation: ({ type, name, memberIds }) => {
        const uniqueMemberIds = Array.from(new Set([currentUser.id, ...memberIds]));
        if (type === "dm") {
          const existingConversation = [...baseConversations].find(
            (conversation) =>
              conversation.type === "dm" &&
              conversation.memberIds.length === uniqueMemberIds.length &&
              conversation.memberIds.every((memberId) => uniqueMemberIds.includes(memberId))
          );

          if (existingConversation) {
            set({ activeConversationId: existingConversation.id });
            return existingConversation.id;
          }
        }

        const directTarget =
          type === "dm"
            ? people.find((person) => person.id === uniqueMemberIds.find((memberId) => memberId !== currentUser.id))
            : null;
        const conversationName =
          type === "dm" ? directTarget?.name ?? "Nouvelle conversation" : name?.trim() || "Nouveau groupe";
        const id = `custom-${Date.now()}`;
        const createdConversation: Conversation = {
          id,
          name: conversationName,
          initials:
            type === "dm"
              ? directTarget?.initials ?? buildConversationInitials(conversationName)
              : buildConversationInitials(conversationName),
          type,
          memberIds: uniqueMemberIds,
          subtitle: buildConversationSubtitle(type, uniqueMemberIds),
          preview: type === "dm" ? "Conversation privée créée." : "Groupe créé.",
          time: formatTime(),
          status: buildConversationStatus(uniqueMemberIds),
        };

        set((state) => ({
          activeConversationId: id,
          customConversations: [createdConversation, ...state.customConversations],
          customMessages: {
            ...state.customMessages,
            [id]: [],
          },
        }));

        return id;
      },
      sendMessage: (conversationId, content) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        const message: ChatMessage = {
          id: `msg-${Date.now()}`,
          authorId: currentUser.id,
          author: currentUser.name,
          initials: currentUser.initials,
          time: formatTime(),
          content: trimmedContent,
        };

        set((state) => {
          const conversationIndex = state.customConversations.findIndex((item) => item.id === conversationId);
          const existingMessages = state.customMessages[conversationId] ?? baseMessages[conversationId] ?? [];

          if (conversationIndex >= 0) {
            const nextConversations = [...state.customConversations];
            nextConversations[conversationIndex] = {
              ...nextConversations[conversationIndex],
              preview: `Vous : ${trimmedContent}`,
              time: message.time,
            };

            return {
              customConversations: nextConversations,
              customMessages: {
                ...state.customMessages,
                [conversationId]: [...existingMessages, message],
              },
            };
          }

          const updatedBaseConversation = baseConversations.find((item) => item.id === conversationId);
          if (!updatedBaseConversation) {
            return state;
          }

          return {
            customConversations: [
              {
                ...updatedBaseConversation,
                preview: `Vous : ${trimmedContent}`,
                time: message.time,
              },
              ...state.customConversations.filter((item) => item.id !== conversationId),
            ],
            customMessages: {
              ...state.customMessages,
              [conversationId]: [...existingMessages, message],
            },
          };
        });
      },
    }),
    {
      name: "aether-chat-store",
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        customConversations: state.customConversations,
        customMessages: state.customMessages,
      }),
    }
  )
);
