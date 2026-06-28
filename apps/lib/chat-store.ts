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
import { deleteConversation as apiDeleteConversation } from "@/lib/api/conversations";

const mockMode = getMockModeEnabled();
import { getConversations, getMessages, sendMessage as apiSendMessage, updateMessage as apiUpdateMessage, createConversation as apiCreateConversation, getMembers, summarizeMessageContent, type ChatServiceDeps } from "@/lib/api/chat-service";

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
  deleteConversation: (conversationId: string, deps?: ChatServiceDeps) => Promise<void>;
  sendMessage: (conversationId: string, content: string, deps?: ChatServiceDeps) => Promise<void>;
  updateMessage: (conversationId: string, messageId: string, content: string, deps?: ChatServiceDeps) => Promise<void>;
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

      deleteConversation: async (conversationId, deps) => {
        if (!getMockModeEnabled() && deps?.currentUser) {
          await apiDeleteConversation(conversationId);
        }

        set((state) => {
          const { [conversationId]: _removedMessages, ...messages } = state.messages;
          const { [conversationId]: _removedCustomMessages, ...customMessages } = state.customMessages;

          return {
            activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
            conversations: state.conversations.filter((conversation) => conversation.id !== conversationId),
            customConversations: state.customConversations.filter((conversation) => conversation.id !== conversationId),
            messages,
            customMessages,
          };
        });
      },

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
          set((state) => {
            const activeConversationId = items.some((c) => c.id === state.activeConversationId)
              ? state.activeConversationId
              : null;
            return {
              conversations: items,
              customConversations: [],
              customMessages: {},
              activeConversationId,
              isLoading: false,
            };
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
          set((state) => {
            const lastMessage = items[0];
            const previewContent = lastMessage ? summarizeMessageContent(lastMessage.content) : "";
            const previewAuthor =
              lastMessage?.authorId === deps.currentUser?.id ? "Vous" : lastMessage?.author;
            const preview = previewContent && previewAuthor ? `${previewAuthor} : ${previewContent}` : previewContent;
            const updateConversation = (conv: Conversation) =>
              conv.id === conversationId ? { ...conv, preview, time: lastMessage?.time ?? conv.time } : conv;
            return {
              messages: {
                ...state.messages,
                [conversationId]: items,
              },
              conversations: state.conversations.map(updateConversation),
              customConversations: state.customConversations.map(updateConversation),
            };
          });
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
                const preview = summarizeMessageContent(sent.content);
                const updateConversation = (conv: Conversation) =>
                  conv.id === conversationId ? { ...conv, preview: `Vous : ${preview}`, time: sent.time } : conv;
                return {
                  messages: {
                    ...state.messages,
                    [conversationId]: [sent, ...existingMessages],
                  },
                  conversations: state.conversations.map(updateConversation),
                  customConversations: state.customConversations.map(updateConversation),
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
                preview: trimmedContent,
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

      updateMessage: async (conversationId, messageId, content, deps) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        if (!getMockModeEnabled() && deps?.currentUser) {
          try {
            const updated = await apiUpdateMessage(messageId, trimmedContent, deps);
            if (updated) {
              set((state) => {
                const targetMessages = state.messages[conversationId] ?? state.customMessages[conversationId] ?? [];
                const updatedMessages = targetMessages.map((msg) =>
                  msg.id === messageId ? updated : msg
                );
                return {
                  messages: {
                    ...state.messages,
                    [conversationId]: updatedMessages,
                  },
                };
              });
            }
          } catch {
            // API call failed
          }
          return;
        }

        if (getMockModeEnabled()) {
          set((state) => {
            const targetMessages = state.messages[conversationId] ?? state.customMessages[conversationId] ?? [];
            const updatedMessages = targetMessages.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: trimmedContent, editedAt: new Date().toISOString() }
                : msg
            );
            return {
              messages: {
                ...state.messages,
                [conversationId]: updatedMessages,
              },
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
          });
        }
      },
    }
  )
);
