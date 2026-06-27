import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSettingsHref,
  canAssignRole,
  canDeleteWorkspace,
  canManageMembers,
  canManageWorkspace,
  canReadAuditLogs,
  parseSettingsSection,
} from "../../components/settings/settings-utils.ts";

test("parseSettingsSection falls back to profile for invalid values", () => {
  assert.equal(parseSettingsSection("profile"), "profile");
  assert.equal(parseSettingsSection("members"), "members");
  assert.equal(parseSettingsSection("oops"), "profile");
  assert.equal(parseSettingsSection(null), "profile");
});

test("buildSettingsHref preserves existing query params", () => {
  const params = new URLSearchParams("workspaceId=ws_123&foo=bar");
  assert.equal(buildSettingsHref("security", params), "/settings?workspaceId=ws_123&foo=bar&section=security");
});

test("workspace permission helpers follow expected role rules", () => {
  const ownerUser = { permissions: ["workspace:write"], roles: ["owner"] } as const;
  const member = { role: "member" };
  const owner = { role: "owner" };

  assert.equal(canManageWorkspace(ownerUser as never, member as never), true);
  assert.equal(canManageMembers(null, member as never), false);
  assert.equal(canReadAuditLogs(null, owner as never), true);
  assert.equal(canDeleteWorkspace(null, owner as never), true);
  assert.equal(canAssignRole("admin", "owner"), false);
  assert.equal(canAssignRole("owner", "owner"), true);
});
