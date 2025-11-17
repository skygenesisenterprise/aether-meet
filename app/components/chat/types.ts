export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  type: 'text' | 'file' | 'image';
  reactions?: { emoji: string; count: number; users: string[] }[];
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants?: string[];
  messages: Message[];
}

export interface ChatCallbacks {
  onSendMessage?: (message: Omit<Message, 'id' | 'timestamp' | 'isOwn'>) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onCallStart?: (type: 'audio' | 'video', conversationId: string) => void;
  onFileUpload?: (file: File) => void;
  onTypingStart?: (conversationId: string) => void;
  onTypingStop?: (conversationId: string) => void;
  onMessageRead?: (conversationId: string, messageId: string) => void;
  onTogglePin?: (conversationId: string) => void;
}

export interface ChatConfig {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  availableEmojis?: string[];
  enableFileUpload?: boolean;
  enableReactions?: boolean;
  enableCalls?: boolean;
  enablePinning?: boolean;
  enableDeletion?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface ChatProps {
  conversationId: string | null;
  conversation?: Conversation;
  pinnedConversations?: Set<string>;
  callbacks?: ChatCallbacks;
  config?: ChatConfig;
  className?: string;
  currentUser?: string;
  emptyState?: React.ReactNode;
}