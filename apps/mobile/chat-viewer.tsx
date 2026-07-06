import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useMobileAuth } from "@/components/mobile/mobile-auth-provider";
import { ScreenTransition } from "@/components/mobile/screen-transition";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";
import {
  loadChatConversation,
  useMobileResource,
  type ConversationMessageItem,
} from "@/lib/mobile/meet-data";

export default function ChatViewerScreen() {
  const insets = usePhoneSafeAreaInsets();
  const params = useLocalSearchParams<{ conversationId?: string; title?: string }>();
  const { session } = useMobileAuth();
  const conversationId = typeof params.conversationId === "string" ? params.conversationId : "";
  const { data, error, loading } = useMobileResource(
    () => loadChatConversation(conversationId, session?.user),
    [conversationId, session?.user.email],
  );

  const scrollRef = React.useRef<ScrollView | null>(null);

  React.useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [loading, data?.messages.length]);

  const title = data?.conversation.title ?? params.title ?? "Conversation";
  const subtitle = data?.conversation.subtitle ?? "Messages";

  return (
    <ScreenTransition direction="up">
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons color="#111827" name="arrow-back" size={23} />
          </Pressable>

          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(title)}</Text>
            </View>
            <View style={styles.titleBlock}>
              <Text numberOfLines={1} style={styles.title}>
                {title}
              </Text>
              <Text numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.iconButton}>
              <MaterialIcons color="#111827" name="call" size={22} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <MaterialIcons color="#111827" name="videocam" size={23} />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#5B5FC7" />
            <Text style={styles.loadingText}>Chargement des messages</Text>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <MaterialIcons color="#B45309" name="error-outline" size={28} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.messages, { paddingBottom: insets.bottom + 92 }]}
            showsVerticalScrollIndicator={false}
          >
            {data?.members.length ? (
              <View style={styles.memberStrip}>
                {data.members.slice(0, 4).map((member) => (
                  <View key={member.id} style={styles.memberPill}>
                    <Text style={styles.memberInitials}>{member.initials}</Text>
                    <Text numberOfLines={1} style={styles.memberName}>
                      {member.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {data?.messages.length ? (
              data.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons color="#5B5FC7" name="forum" size={42} />
                <Text style={styles.emptyTitle}>Aucun message</Text>
                <Text style={styles.emptyText}>Cette conversation est prête à démarrer.</Text>
              </View>
            )}
          </ScrollView>
        )}

        <View style={[styles.composerWrap, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.composer}>
            <Pressable style={styles.attachButton}>
              <MaterialIcons color="#6B7280" name="attach-file" size={22} />
            </Pressable>
            <TextInput
              editable={false}
              placeholder="Répondre"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <Pressable style={styles.sendButton}>
              <MaterialIcons color="#FFFFFF" name="send" size={19} />
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenTransition>
  );
}

function MessageBubble({ message }: { message: ConversationMessageItem }) {
  return (
    <View style={[styles.messageRow, message.mine ? styles.messageRowMine : null]}>
      {!message.mine ? (
        <View style={styles.messageAvatar}>
          <Text style={styles.messageAvatarText}>{message.authorInitials}</Text>
        </View>
      ) : null}
      <View style={[styles.bubble, message.mine ? styles.bubbleMine : styles.bubbleOther]}>
        {!message.mine ? (
          <Text numberOfLines={1} style={styles.author}>
            {message.authorName}
          </Text>
        ) : null}
        <Text style={[styles.body, message.mine ? styles.bodyMine : null]}>{message.body}</Text>
        <Text style={[styles.messageTime, message.mine ? styles.messageTimeMine : null]}>
          {message.timestampLabel}
        </Text>
      </View>
    </View>
  );
}

function getInitials(value: string): string {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  attachButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 36,
  },
  author: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#E6E7FF",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: {
    color: "#3F43A7",
    fontSize: 13,
    fontWeight: "900",
  },
  backButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 38,
  },
  body: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
  bodyMine: {
    color: "#FFFFFF",
  },
  bubble: {
    borderRadius: 18,
    maxWidth: "78%",
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: "#5B5FC7",
    borderBottomRightRadius: 5,
  },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 5,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  composer: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 50,
    paddingHorizontal: 8,
  },
  composerWrap: {
    backgroundColor: "rgba(246,246,251,0.96)",
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    position: "absolute",
    right: 0,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    minHeight: 340,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  errorState: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  iconButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 34,
  },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minWidth: 0,
  },
  input: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 42,
    paddingVertical: 0,
  },
  loading: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
  memberInitials: {
    color: "#3F43A7",
    fontSize: 11,
    fontWeight: "900",
  },
  memberName: {
    color: "#4B5563",
    fontSize: 12,
    fontWeight: "800",
    maxWidth: 86,
  },
  memberPill: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  memberStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  messageAvatar: {
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    marginTop: 4,
    width: 30,
  },
  messageAvatarText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "900",
  },
  messageRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageTime: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },
  messageTimeMine: {
    color: "#EDEEFF",
  },
  messages: {
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  screen: {
    backgroundColor: "#F6F6FB",
    flex: 1,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#5B5FC7",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
});
