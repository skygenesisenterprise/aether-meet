"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SettingsShell } from "@/components/settings/settings-shell";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { MediaSettings } from "@/components/settings/media-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { SessionSettings } from "@/components/settings/session-settings";
import {
  buildSettingsHref,
  canDeleteWorkspace,
  canManageMembers,
  canManageWorkspace,
  canReadAuditLogs,
  DEFAULT_SETTINGS_SECTION,
  getWorkspaceMembership,
  parseSettingsSection,
  type SettingsSection,
} from "@/components/settings/settings-utils";
import { WorkspaceAuditSettings } from "@/components/settings/workspace-audit-settings";
import { WorkspaceDangerSettings } from "@/components/settings/workspace-danger-settings";
import { WorkspaceGeneralSettings } from "@/components/settings/workspace-general-settings";
import { WorkspaceMembersSettings } from "@/components/settings/workspace-members-settings";
import { WorkspaceRolesSettings } from "@/components/settings/workspace-roles-settings";
import { useAuth } from "@/context/AuthContext";
import { usePlatform } from "@/context/PlatformContext";
import { ApiError, getUserFacingError } from "@/lib/api/errors";
import { getWorkspace } from "@/lib/api/workspaces";
import { listWorkspaceMembers } from "@/lib/api/members";
import type { User, Workspace, WorkspaceMember } from "@/lib/api/types";

function GlobalState({ message }: { message: string }) {
  return <div className="flex h-full items-center justify-center bg-[#232426] p-6 text-sm text-zinc-400">{message}</div>;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, activeWorkspace, isLoading, error } = usePlatform();
  const { logout } = useAuth();
  const section = parseSettingsSection(searchParams.get("section"));
  const [userState, setUserState] = React.useState<User | null>(null);
  const [workspaceState, setWorkspaceState] = React.useState<Workspace | null>(null);
  const [members, setMembers] = React.useState<WorkspaceMember[]>([]);
  const [contentLoading, setContentLoading] = React.useState(true);
  const [contentError, setContentError] = React.useState<string | null>(null);
  const isWorkspaceSection = section === "workspace" || section === "members" || section === "roles" || section === "audit" || section === "danger";

  React.useEffect(() => {
    if (searchParams.get("section") && searchParams.get("section") !== section) {
      router.replace(buildSettingsHref(DEFAULT_SETTINGS_SECTION, searchParams));
    }
  }, [router, searchParams, section]);

  React.useEffect(() => {
    setUserState(currentUser);
  }, [currentUser]);

  React.useEffect(() => {
    if (isLoading) {
      setContentLoading(true);
      setContentError(null);
      return;
    }
    setContentError(null);
    if (!activeWorkspace) {
      setWorkspaceState(null);
      setMembers([]);
      setContentLoading(false);
      return;
    }
    if (!isWorkspaceSection) {
      setWorkspaceState(activeWorkspace);
      setMembers([]);
      setContentLoading(false);
      return;
    }
    const workspaceId = activeWorkspace.id;
    let cancelled = false;
    async function load() {
      setContentLoading(true);
      try {
        const [workspaceDetails, workspaceMembers] = await Promise.all([
          getWorkspace(workspaceId),
          listWorkspaceMembers(workspaceId),
        ]);
        if (!cancelled) {
          setWorkspaceState(workspaceDetails);
          setMembers(workspaceMembers);
        }
      } catch (cause) {
        if (cancelled) {
          return;
        }
        if (cause instanceof ApiError && (cause.code === "MEMBERSHIP_REQUIRED" || cause.status === 403 || cause.status === 404)) {
          setWorkspaceState(null);
          setMembers([]);
          setContentError("Le workspace sélectionné n’est plus accessible pour ce compte.");
          router.replace(buildSettingsHref(DEFAULT_SETTINGS_SECTION, searchParams));
          return;
        }
        setWorkspaceState(activeWorkspace);
        setMembers([]);
        setContentError(getUserFacingError(cause));
      } finally {
        if (!cancelled) {
          setContentLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, isLoading, isWorkspaceSection, router, searchParams]);

  const membership = React.useMemo(
    () => getWorkspaceMembership(userState, members, workspaceState ?? activeWorkspace),
    [activeWorkspace, members, userState, workspaceState]
  );
  const canEditWorkspace = canManageWorkspace(userState, membership);
  const canEditMembers = canManageMembers(userState, membership);
  const canReadAudit = canReadAuditLogs(userState, membership);
  const canDelete = canDeleteWorkspace(userState, membership);

  function handleSectionChange(nextSection: SettingsSection) {
    router.replace(buildSettingsHref(nextSection, searchParams));
  }

  if (isLoading) {
    return <GlobalState message="Chargement de la console de paramètres…" />;
  }

  if (error) {
    return <GlobalState message="Impossible de charger le contexte plateforme." />;
  }

  if (contentLoading) {
    return <GlobalState message="Chargement des données settings…" />;
  }

  if (isWorkspaceSection && !activeWorkspace) {
    return <GlobalState message="Aucun workspace actif n’est disponible pour cette section." />;
  }

  if (isWorkspaceSection && contentError) {
    return <GlobalState message={contentError} />;
  }

  return (
    <SettingsShell section={section} onSectionChange={handleSectionChange} workspace={workspaceState ?? activeWorkspace}>
      {section === "profile" ? <ProfileSettings user={userState} onUserChange={setUserState} /> : null}
      {section === "appearance" ? <AppearanceSettings /> : null}
      {section === "notifications" ? <NotificationSettings /> : null}
      {section === "media" ? <MediaSettings /> : null}
      {section === "security" ? <SecuritySettings user={userState} /> : null}
      {section === "sessions" ? <SessionSettings onLoggedOut={logout} /> : null}
      {section === "workspace" ? (
        <WorkspaceGeneralSettings
          workspace={workspaceState ?? activeWorkspace}
          members={members}
          canEdit={canEditWorkspace}
          onWorkspaceChange={setWorkspaceState}
        />
      ) : null}
      {section === "members" ? (
        <WorkspaceMembersSettings
          workspace={workspaceState ?? activeWorkspace}
          currentUser={userState}
          members={members}
          actorRole={membership?.role}
          canManage={canEditMembers}
          onMembersChange={setMembers}
        />
      ) : null}
      {section === "roles" ? <WorkspaceRolesSettings currentUser={userState} membership={membership} /> : null}
      {section === "audit" ? <WorkspaceAuditSettings workspace={workspaceState ?? activeWorkspace} canRead={canReadAudit} members={members} /> : null}
      {section === "danger" ? (
        <WorkspaceDangerSettings
          workspace={workspaceState ?? activeWorkspace}
          canDelete={canDelete}
          onWorkspaceDeleted={() => router.replace("/settings")}
        />
      ) : null}
    </SettingsShell>
  );
}
