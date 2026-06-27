"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { clearStoredTokens } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { getMe } from "@/lib/api/me";
import { getSharedRealtimeClient } from "@/lib/api/realtime/client";
import type { RealtimeEvent } from "@/lib/api/realtime/events";
import type { User, Workspace } from "@/lib/api/types";
import { listWorkspaces } from "@/lib/api/workspaces";

const ACTIVE_WORKSPACE_STORAGE_KEY = "aether.activeWorkspaceId";

interface PlatformContextValue {
  currentUser: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId(id: string): void;
  isLoading: boolean;
  error: ApiError | null;
  isRealtimeConnected: boolean;
  lastRealtimeEvent: RealtimeEvent | null;
}

const PlatformContext = React.createContext<PlatformContextValue | undefined>(undefined);

function readStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
}

function writeStoredWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
}

function resolveWorkspaceId(searchParams: URLSearchParams | null): string | null {
  return searchParams?.get("workspaceId") ?? readStoredWorkspaceId();
}

function replaceWorkspaceParam(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams | null,
  workspaceId: string
): void {
  const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
  nextParams.set("workspaceId", workspaceId);
  router.replace(`${pathname}?${nextParams.toString()}`);
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = React.useState(false);
  const [lastRealtimeEvent, setLastRealtimeEvent] = React.useState<RealtimeEvent | null>(null);

  const setActiveWorkspaceId = React.useCallback(
    (workspaceId: string) => {
      writeStoredWorkspaceId(workspaceId);
      setActiveWorkspaceIdState(workspaceId);
      replaceWorkspaceParam(router, pathname, searchParams, workspaceId);
      getSharedRealtimeClient().setWorkspace(workspaceId);
    },
    [pathname, router, searchParams]
  );

  React.useEffect(() => {
    let cancelled = false;

    async function loadPlatformContext() {
      setIsLoading(true);
      setError(null);

      try {
        const [user, availableWorkspaces] = await Promise.all([getMe(), listWorkspaces()]);
        if (cancelled) {
          return;
        }

        setCurrentUser(user);
        setWorkspaces(availableWorkspaces);

        const requestedWorkspaceId = resolveWorkspaceId(searchParams);
        const resolvedWorkspace =
          availableWorkspaces.find((workspace) => workspace.id === requestedWorkspaceId) ?? availableWorkspaces[0] ?? null;

        setActiveWorkspaceIdState(resolvedWorkspace?.id ?? null);
        if (resolvedWorkspace?.id) {
          writeStoredWorkspaceId(resolvedWorkspace.id);
          if (requestedWorkspaceId !== resolvedWorkspace.id) {
            replaceWorkspaceParam(router, pathname, searchParams, resolvedWorkspace.id);
          }
        }
      } catch (cause) {
        if (cancelled) {
          return;
        }

        const normalized =
          cause instanceof ApiError
            ? cause
            : new ApiError({ status: 500, message: "Failed to load platform context." });

        if (normalized.status === 401) {
          clearStoredTokens();
        }

        setError(normalized);
        setCurrentUser(null);
        setWorkspaces([]);
        setActiveWorkspaceIdState(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPlatformContext();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  React.useEffect(() => {
    if (!activeWorkspaceId) {
      return;
    }

    const realtime = getSharedRealtimeClient();
    realtime.setWorkspace(activeWorkspaceId);
    void realtime.connect().then(
      () => setIsRealtimeConnected(true),
      () => setIsRealtimeConnected(false)
    );

    const subscription = realtime.subscribe((event) => {
      setLastRealtimeEvent(event);
    });

    return () => {
      subscription.unsubscribe();
      setIsRealtimeConnected(false);
    };
  }, [activeWorkspaceId]);

  const value = React.useMemo<PlatformContextValue>(
    () => ({
      currentUser,
      workspaces,
      activeWorkspace: workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null,
      activeWorkspaceId,
      setActiveWorkspaceId,
      isLoading,
      error,
      isRealtimeConnected,
      lastRealtimeEvent,
    }),
    [activeWorkspaceId, currentUser, error, isLoading, isRealtimeConnected, lastRealtimeEvent, setActiveWorkspaceId, workspaces]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
  const context = React.useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }

  return context;
}
