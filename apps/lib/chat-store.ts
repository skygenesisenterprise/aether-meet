import { create } from "zustand";

interface ChatState {
  activeConversationId: string;
  setActiveConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: "product",
  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
