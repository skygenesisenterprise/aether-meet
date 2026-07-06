import * as React from "react";

import { StyleSheet, Text, View } from "react-native";

import { useMobileAuth } from "@/components/mobile/mobile-auth-provider";
import {
  MobileEmptyState,
  MobileListRow,
  MobileListSection,
  MobilePlatformScreen,
} from "@/components/mobile/mobile-platform-shell";
import {
  loadCalendarHub,
  useMobileResource,
  type CalendarMeetingItem,
} from "@/lib/mobile/meet-data";

const filters = [
  { icon: "today", label: "Jour" },
  { icon: "date-range", label: "Semaine" },
  { icon: "videocam", label: "Réunions" },
  { icon: "schedule", label: "À venir" },
  { icon: "add", label: "Créer" },
] as const;

function getStatusLabel(status: CalendarMeetingItem["status"]) {
  if (status === "live") return "En cours";
  if (status === "upcoming") return "À venir";
  return "Terminé";
}

function getStatusColor(status: CalendarMeetingItem["status"]) {
  if (status === "live") return "#16A34A";
  if (status === "upcoming") return "#5B5FC7";
  return "#64748B";
}

export default function CalendarScreen() {
  const { session } = useMobileAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data, error, loading } = useMobileResource(
    () => loadCalendarHub(session?.user),
    [session?.user.email, refreshKey],
  );

  return (
    <MobilePlatformScreen
      actions={[{ icon: "add", label: "Nouvel événement" }]}
      empty={<MobileEmptyState icon="event-busy" label="Votre calendrier est libre." />}
      error={error}
      filters={[...filters]}
      loading={loading}
      onRefresh={() => setRefreshKey((value) => value + 1)}
      primaryAction={{ icon: "video-call", label: "Planifier" }}
      refreshing={loading}
      route="calendar"
      showEmpty={!loading && (data?.items.length ?? 0) === 0}
      subtitle="Agenda partagé Aether Meet"
      title="Calendrier"
    >
      <MobileListSection title="Prochaines réunions">
        {data?.items.map((item) => (
          <MobileListRow
            accent={getStatusColor(item.status)}
            icon="event"
            key={item.id}
            meta={item.timeLabel}
            subtitle={item.location}
            title={item.title}
          >
            <View style={styles.statusLine}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
              <Text style={styles.statusDate}>{item.dateLabel}</Text>
            </View>
          </MobileListRow>
        ))}
      </MobileListSection>
    </MobilePlatformScreen>
  );
}

const styles = StyleSheet.create({
  statusDate: {
    color: "#6B7280",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  statusDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  statusLine: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },
});
