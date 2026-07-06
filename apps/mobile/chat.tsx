import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useMobileAuth } from "@/components/mobile/mobile-auth-provider";
import {
  MobileEmptyState,
  MobileListSection,
  MobilePlatformScreen,
} from "@/components/mobile/mobile-platform-shell";
import {
  loadChatHub,
  useMobileResource,
  type ConversationPreviewItem,
} from "@/lib/mobile/meet-data";

const filters = [
  { icon: "campaign", label: "S'informer" },
  { icon: "sort", label: "Récent" },
  { icon: "mark-chat-unread", label: "Non lues" },
  { icon: "alternate-email", label: "Mentions" },
  { icon: "more-horiz", label: "Autres" },
] as const;

const presenceColors: Record<ConversationPreviewItem["presence"], string> = {
  away: "#F59E0B",
  busy: "#DC2626",
  offline: "#94A3B8",
  online: "#16A34A",
};

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

function getKindLabel(kind: ConversationPreviewItem["kind"]) {
  if (kind === "direct") return "Direct";
  if (kind === "team") return "Canal";
  return "Groupe";
}

export default function ChatScreen() {
  const { session } = useMobileAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data, error, loading } = useMobileResource(
    () => loadChatHub(session?.user),
    [session?.user.email, refreshKey],
  );

  const unreadCount = data?.items.reduce((total, item) => total + item.unreadCount, 0) ?? 0;

  return (
    <MobilePlatformScreen
      actions={[{ icon: "more-horiz", label: "Options" }]}
      empty={
        <MobileEmptyState
          icon="chat-bubble-outline"
          label="Vos conversations privées en tête à tête ou en groupe."
        />
      }
      error={error}
      filters={[...filters]}
      loading={loading}
      onRefresh={() => setRefreshKey((value) => value + 1)}
      primaryAction={{ icon: "edit-square", label: "Nouveau message" }}
      refreshing={loading}
      route="chat"
      showEmpty={!loading && (data?.items.length ?? 0) === 0}
      subtitle={`${unreadCount} message${unreadCount > 1 ? "s" : ""} à lire`}
      title="Conversation"
    >
      <MobileListSection title="Conversations récentes">
        {data?.items.map((item) => (
          <ConversationRow item={item} key={item.id} />
        ))}
      </MobileListSection>
    </MobilePlatformScreen>
  );
}

function ConversationRow({ item }: { item: ConversationPreviewItem }) {
  const presenceColor = presenceColors[item.presence];

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/chat-viewer" as never,
          params: {
            conversationId: item.id,
            title: item.title,
          },
        });
      }}
      style={styles.row}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.title)}</Text>
        </View>
        <View style={[styles.presence, { backgroundColor: presenceColor }]} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleLine}>
          <Text numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>
          <Text style={styles.time}>{item.timestampLabel}</Text>
        </View>

        <View style={styles.metaLine}>
          <Text style={styles.kind}>{getKindLabel(item.kind)}</Text>
          <Text style={styles.dot}>•</Text>
          <Text numberOfLines={1} style={styles.meta}>
            {item.subtitle || item.participantsLabel}
          </Text>
        </View>

        <View style={styles.previewLine}>
          <Text numberOfLines={2} style={styles.preview}>
            {item.excerpt}
          </Text>
          {item.unreadCount ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <MaterialIcons color="#9CA3AF" name="chevron-right" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: "#E6E7FF",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: "#3F43A7",
    fontSize: 14,
    fontWeight: "900",
  },
  avatarWrap: {
    height: 52,
    width: 52,
  },
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#5B5FC7",
    borderRadius: 999,
    minWidth: 24,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  dot: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "900",
  },
  kind: {
    color: "#5B5FC7",
    fontSize: 12,
    fontWeight: "900",
  },
  meta: {
    color: "#6B7280",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  metaLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  presence: {
    borderColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 2,
    bottom: 2,
    height: 13,
    position: "absolute",
    right: 2,
    width: 13,
  },
  preview: {
    color: "#6B7280",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  previewLine: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  row: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#EEF0F4",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  time: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },
  title: {
    color: "#111827",
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  titleLine: {
    alignItems: "center",
    flexDirection: "row",
    minWidth: 0,
  },
});
