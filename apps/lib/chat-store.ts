import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  conversationMessages,
  conversations as mockConversations,
  currentUser as mockCurrentUser,
  people,
  type ChatMessage,
  type Conversation,
} from "@/lib/platform-data";
import { getMockModeEnabled } from "@/lib/api/config";

const mockMode = getMockModeEnabled();
import { getConversations, getMessages, sendMessage as apiSendMessage, createConversation as apiCreateConversation, getMembers, type ChatServiceDeps } from "@/lib/api/chat-service";

interface CreateConversationInput {
  type: "dm" | "channel";
  name?: string;
  memberIds: string[];
}

interface ChatState {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  customConversations: Conversation[];
  customMessages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  setActiveConversation: (id: string | null) => void;
  createConversation: (input: CreateConversationInput, deps?: ChatServiceDeps) => Promise<string>;
  sendMessage: (conversationId: string, content: string, deps?: ChatServiceDeps) => Promise<void>;
  loadChatData: (deps: ChatServiceDeps) => Promise<void>;
  loadMessages: (conversationId: string, deps: ChatServiceDeps) => Promise<void>;
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
    people.find((person) => memberIds.includes(person.id) && person.id !== mockCurrentUser.id)?.status ?? "online"
  );
}

function buildConversationSubtitle(type: "dm" | "channel", memberIds: string[]) {
  const members = memberIds
    .map((memberId) => people.find((person) => person.id === memberId))
    .filter((member): member is (typeof people)[number] => Boolean(member));

  if (type === "dm") {
    return members.find((member) => member.id !== mockCurrentUser.id)?.role ?? "Conversation privée";
  }

  const onlineCount = members.filter((member) => member.status === "online").length;
  return `${members.length} membres · ${onlineCount} en ligne`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeConversationId: null,
      conversations: mockMode ? mockConversations : [],
      messages: mockMode ? conversationMessages : {},
      customConversations: [],
      customMessages: {},
      isLoading: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),

      loadChatData: async (deps) => {
        if (getMockModeEnabled()) return;

        if (!deps.workspaceId || !deps.currentUser) {
          set({
            conversations: [],
            customConversations: [],
            customMessages: {},
            messages: {},
            activeConversationId: null,
          });
          return;
        }

        set({ isLoading: true });
        try {
          const items = await getConversations(deps);
          set({
            conversations: items,
            customConversations: [],
            customMessages: {},
            messages: {},
            activeConversationId: null,
            isLoading: false,
          });
        } catch {
          set({
            conversations: [],
            customConversations: [],
            customMessages: {},
            messages: {},
            activeConversationId: null,
            isLoading: false,
          });
        }
      },

      loadMessages: async (conversationId, deps) => {
        if (getMockModeEnabled()) return;
        if (!deps.workspaceId || !deps.currentUser) return;

        try {
          const items = await getMessages(conversationId, deps);
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: items,
            },
          }));
        } catch {
          // keep existing messages
        }
      },

      createConversation: async ({ type, name, memberIds }, deps?) => {
        if (!getMockModeEnabled() && deps?.workspaceId && deps?.currentUser) {
          const created = await apiCreateConversation(deps, { type, name, memberIds });
          if (created) {
            set((state) => ({
              activeConversationId: created.id,
              conversations: [created, ...state.conversations.filter((c) => c.id !== created.id)],
              messages: { ...state.messages, [created.id]: [] },
            }));
            return created.id;
          }
        }

        if (getMockModeEnabled()) {
          const uniqueMemberIds = Array.from(new Set([mockCurrentUser.id, ...memberIds]));
          if (type === "dm") {
            const existingConversation = [...mockConversations, ...get().customConversations, ...get().conversations].find(
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
              ? people.find((person) => person.id === uniqueMemberIds.find((memberId) => memberId !== mockCurrentUser.id))
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
        }

        return "";
      },

      sendMessage: async (conversationId, content, deps) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        if (!getMockModeEnabled() && deps?.currentUser) {
          try {
            const sent = await apiSendMessage(conversationId, trimmedContent, deps);
            if (sent) {
              set((state) => {
                const existingMessages = state.messages[conversationId] ?? state.customMessages[conversationId] ?? [];
                return {
                  messages: {
                    ...state.messages,
                    [conversationId]: [...existingMessages, sent],
                  },
                };
              });
              return;
            }
          } catch {
            // API call failed, skip mock fallback in real mode
            return;
          }
        }

        if (getMockModeEnabled()) {
          const message: ChatMessage = {
            id: `msg-${Date.now()}`,
            authorId: mockCurrentUser.id,
            author: mockCurrentUser.name,
            initials: mockCurrentUser.initials,
            time: formatTime(),
            content: trimmedContent,
          };

          set((state) => {
            const existingMessages = state.messages[conversationId] ?? state.customMessages[conversationId] ?? [];
            const updatedMessages = {
              ...state.messages,
              [conversationId]: [...existingMessages, message],
            };

            const conversationIndex = state.customConversations.findIndex((item) => item.id === conversationId);
            if (conversationIndex >= 0) {
              const nextConversations = [...state.customConversations];
              nextConversations[conversationIndex] = {
                ...nextConversations[conversationIndex],
                preview: `Vous : ${trimmedContent}`,
                time: message.time,
              };
              return {
                customConversations: nextConversations,
                messages: updatedMessages,
              };
            }

            const base = state.conversations.find((item) => item.id === conversationId);
            if (!base) {
              return { messages: updatedMessages };
            }

            return {
              customConversations: [
                { ...base, preview: `Vous : ${trimmedContent}`, time: message.time },
                ...state.customConversations.filter((item) => item.id !== conversationId),
              ],
              messages: updatedMessages,
            };
          });
        }
      },
    }),
    {
      name: "aether-chat-store",
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        customConversations: state.customConversations,
        customMessages: state.customMessages,
      }),
      onRehydrateStorage: () => (state) => {
        if (!getMockModeEnabled() && state) {
          useChatStore.setState({
            customConversations: [],
            customMessages: {},
            activeConversationId: null,
          });
        }
      },
    }
  )
);
