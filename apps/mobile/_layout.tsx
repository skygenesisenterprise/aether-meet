import * as React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import "@/styles/globals.css";

import { MobileAuthProvider, useMobileAuth } from "@/components/mobile/mobile-auth-provider";
import { PortalProvider, usePortal } from "@/components/mobile/portal-provider";
import { emitTabScrollToTop } from "@/components/mobile/tab-scroll-to-top";

const ignoredWebWarnings = [
  "props.pointerEvents is deprecated. Use style.pointerEvents",
];

if (process.env.NODE_ENV !== "production" && Platform.OS === "web") {
  LogBox.ignoreLogs(ignoredWebWarnings);

  const consoleWithAetherFilter = console as Console & {
    __aetherMobileWebWarningFilter?: boolean;
  };

  if (!consoleWithAetherFilter.__aetherMobileWebWarningFilter) {
    const originalWarn = console.warn.bind(console);

    consoleWithAetherFilter.warn = (...args: unknown[]) => {
      const message = typeof args[0] === "string" ? args[0] : "";
      if (ignoredWebWarnings.some((warning) => message.includes(warning))) {
        return;
      }
      originalWarn(...args);
    };
    consoleWithAetherFilter.__aetherMobileWebWarningFilter = true;
  }
}

interface TabIconProps {
  color: React.ComponentProps<typeof MaterialIcons>["color"];
  focused: boolean;
  name: React.ComponentProps<typeof MaterialIcons>["name"];
}

function WebPhoneFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.browserStage}>
      <View style={styles.phoneShell}>
        <View style={styles.dynamicIsland} />
        <View style={styles.phoneScreen}>{children}</View>
      </View>
    </View>
  );
}

function TabIcon({ color, focused, name }: TabIconProps) {
  return (
    <View style={[styles.tabIconWrap, focused ? styles.tabIconWrapActive : null]}>
      <MaterialIcons color={color} name={name} size={24} />
    </View>
  );
}

function MobileLayoutTabs() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { hasPortalContent } = usePortal();
  const { isAuthenticated, isHydrating, isLocked } = useMobileAuth();
  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/unlock";

  if (isHydrating) {
    return null;
  }

  if (!isAuthenticated && !isPublicRoute) {
    return <Redirect href="/login" />;
  }

  if (isAuthenticated && isLocked && pathname !== "/unlock") {
    return <Redirect href="/unlock" />;
  }

  if (isAuthenticated && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    return <Redirect href={"/activity" as never} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#F6F6FB",
        },
        tabBarActiveTintColor: "#5B5FC7",
        tabBarInactiveTintColor: "#111827",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          lineHeight: 13,
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.98)",
          borderTopColor: "#D7DBE7",
          borderTopWidth: 1,
          bottom: 0,
          display: hasPortalContent ? "none" : "flex",
          height: 72 + insets.bottom,
          left: 0,
          paddingBottom: insets.bottom + 7,
          paddingTop: 6,
          position: "absolute",
          right: 0,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="register" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="unlock" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="chat-viewer" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            if (pathname === "/activity") emitTabScrollToTop("activity");
          },
        }}
        name="activity"
        options={{
          title: "Activités",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="notifications-none" />,
          tabBarLabel: "Activités",
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            if (pathname === "/chat") emitTabScrollToTop("chat");
          },
        }}
        name="chat"
        options={{
          title: "Conversation",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="chat-bubble-outline" />,
          tabBarLabel: "Conversation",
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            if (pathname === "/teams") emitTabScrollToTop("teams");
          },
        }}
        name="teams"
        options={{
          title: "Équipes",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="groups-2" />,
          tabBarLabel: "Équipes",
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            if (pathname === "/calendar") emitTabScrollToTop("calendar");
          },
        }}
        name="calendar"
        options={{
          title: "Calendrier",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="calendar-today" />,
          tabBarLabel: "Calendrier",
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            if (pathname === "/calls") emitTabScrollToTop("calls");
          },
        }}
        name="calls"
        options={{
          title: "Appels",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="call" />,
          tabBarLabel: "Appels",
        }}
      />
    </Tabs>
  );
}

export default function MobileRootLayout() {
  return (
    <SafeAreaProvider>
      <MobileAuthProvider>
        <PortalProvider>
          <StatusBar style="dark" />
          <WebPhoneFrame>
            <MobileLayoutTabs />
          </WebPhoneFrame>
        </PortalProvider>
      </MobileAuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  browserStage: {
    alignItems: "center",
    backgroundColor: "#E9EDF5",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  phoneShell: {
    backgroundColor: "#0B1020",
    borderRadius: 48,
    height: "100%",
    maxHeight: 900,
    maxWidth: 430,
    overflow: "hidden",
    padding: 10,
    width: "100%",
  },
  dynamicIsland: {
    alignSelf: "center",
    backgroundColor: "#09090B",
    borderRadius: 999,
    height: 24,
    marginTop: 8,
    position: "absolute",
    width: 92,
    zIndex: 5,
  },
  phoneScreen: {
    backgroundColor: "#F6F6FB",
    borderRadius: 38,
    flex: 1,
    overflow: "hidden",
  },
  tabIconWrap: {
    alignItems: "center",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    width: 42,
  },
  tabIconWrapActive: {
    backgroundColor: "#E6E7FF",
  },
});
