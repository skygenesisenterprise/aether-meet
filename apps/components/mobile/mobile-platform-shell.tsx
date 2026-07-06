import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenTransition } from "@/components/mobile/screen-transition";
import {
  type MainTabRoute,
  useTabScrollToTop,
} from "@/components/mobile/tab-scroll-to-top";
import { usePhoneSafeAreaInsets } from "@/components/mobile/use-phone-safe-area";

const floatingButtonShadow =
  Platform.select({
    web: {
      boxShadow: "0 12px 18px rgba(49, 46, 129, 0.23)",
    },
    default: {
      shadowColor: "#312E81",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.23,
      shadowRadius: 18,
      elevation: 8,
    },
  }) ?? {};

export interface MobileAction {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress?: () => void;
}

export interface MobileFilter {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
}

interface MobilePlatformScreenProps {
  actions?: MobileAction[];
  children: React.ReactNode;
  empty?: React.ReactNode;
  error?: string | null;
  filters?: MobileFilter[];
  loading?: boolean;
  onRefresh?: () => void;
  primaryAction?: MobileAction;
  refreshing?: boolean;
  route: MainTabRoute;
  showEmpty?: boolean;
  subtitle?: string;
  title: string;
  userInitials?: string;
}

interface MobileListRowProps {
  accent?: string;
  badge?: string | number;
  children?: React.ReactNode;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  meta?: string;
  onPress?: () => void;
  subtitle: string;
  title: string;
}

interface MobileStatPillProps {
  label: string;
  value: string;
}

export function MobilePlatformScreen({
  actions = [],
  children,
  empty,
  error,
  filters = [],
  loading,
  onRefresh,
  primaryAction,
  refreshing = false,
  route,
  showEmpty = false,
  subtitle,
  title,
  userInitials = "AM",
}: MobilePlatformScreenProps) {
  const insets = usePhoneSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView | null>(null);
  const searchAction: MobileAction = { icon: "search", label: "Rechercher" };
  const headerActions: MobileAction[] = [...actions, searchAction].slice(0, 3);

  useTabScrollToTop(route, scrollRef);

  return (
    <ScreenTransition direction="up">
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 104 },
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                onRefresh={onRefresh}
                refreshing={refreshing}
                tintColor="#5B5FC7"
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.identityRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
              <View style={styles.titleBlock}>
                <Text numberOfLines={1} style={styles.title}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text numberOfLines={1} style={styles.subtitle}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.headerActions}>
              {headerActions.map((action) => (
                <Pressable
                  accessibilityLabel={action.label}
                  hitSlop={10}
                  key={action.label}
                  onPress={action.onPress}
                  style={styles.iconButton}
                >
                  <MaterialIcons color="#111827" name={action.icon} size={24} />
                </Pressable>
              ))}
            </View>
          </View>

          {filters.length ? (
            <ScrollView
              contentContainerStyle={styles.filters}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {filters.map((filter, index) => (
                <Pressable
                  key={filter.label}
                  style={[styles.filterChip, index === 0 ? styles.filterChipActive : null]}
                >
                  <MaterialIcons
                    color={index === 0 ? "#3F43A7" : "#4B5563"}
                    name={filter.icon}
                    size={20}
                  />
                  <Text style={[styles.filterLabel, index === 0 ? styles.filterLabelActive : null]}>
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {error ? (
            <View style={styles.notice}>
              <MaterialIcons color="#B45309" name="error-outline" size={19} />
              <Text style={styles.noticeText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#5B5FC7" />
              <Text style={styles.loadingText}>Chargement</Text>
            </View>
          ) : showEmpty && empty ? (
            empty
          ) : (
            children
          )}
        </ScrollView>

        {primaryAction ? (
          <Pressable onPress={primaryAction.onPress} style={styles.floatingButton}>
            <MaterialIcons color="#FFFFFF" name={primaryAction.icon} size={22} />
            <Text style={styles.floatingButtonText}>{primaryAction.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </ScreenTransition>
  );
}

export function MobileListSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.list}>{children}</View>
    </View>
  );
}

export function MobileListRow({
  accent = "#5B5FC7",
  badge,
  children,
  icon = "chat-bubble-outline",
  meta,
  onPress,
  subtitle,
  title,
}: MobileListRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: `${accent}18` }]}>
        <MaterialIcons color={accent} name={icon} size={22} />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTitleLine}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {title}
          </Text>
          {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
        </View>
        <Text numberOfLines={2} style={styles.rowSubtitle}>
          {subtitle}
        </Text>
        {children}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function MobileStatPill({ label, value }: MobileStatPillProps) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function MobileEmptyState({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyArtwork}>
        <MaterialIcons color="#5B5FC7" name={icon} size={54} />
      </View>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: "#DDE0FF",
    borderColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: {
    color: "#3F43A7",
    fontSize: 14,
    fontWeight: "900",
  },
  badge: {
    alignItems: "center",
    alignSelf: "center",
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
  content: {
    gap: 16,
    paddingHorizontal: 16,
  },
  emptyArtwork: {
    alignItems: "center",
    backgroundColor: "#ECEEFF",
    borderRadius: 999,
    height: 118,
    justifyContent: "center",
    width: 118,
  },
  emptyState: {
    alignItems: "center",
    gap: 18,
    minHeight: 360,
    justifyContent: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    maxWidth: 270,
    textAlign: "center",
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    height: 62,
    justifyContent: "center",
    minWidth: 76,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: "#F4F5FF",
    borderColor: "#D8DAFF",
  },
  filterLabel: {
    color: "#4B5563",
    fontSize: 11,
    fontWeight: "800",
  },
  filterLabelActive: {
    color: "#3F43A7",
  },
  filters: {
    gap: 8,
    paddingRight: 16,
  },
  floatingButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#5B5FC7",
    borderRadius: 999,
    bottom: 94,
    flexDirection: "row",
    gap: 9,
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 22,
    position: "absolute",
    right: 16,
    ...floatingButtonShadow,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  iconButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  identityRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minWidth: 0,
  },
  list: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  loading: {
    alignItems: "center",
    gap: 12,
    minHeight: 340,
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
  notice: {
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  noticeText: {
    color: "#92400E",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  row: {
    alignItems: "flex-start",
    borderBottomColor: "#EEF0F4",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowContent: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  rowMeta: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 8,
  },
  rowSubtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  rowTitle: {
    color: "#111827",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  rowTitleLine: {
    alignItems: "center",
    flexDirection: "row",
    minWidth: 0,
  },
  screen: {
    backgroundColor: "#F6F6FB",
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
    paddingHorizontal: 2,
    textTransform: "uppercase",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  statPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#111827",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 0,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
});
