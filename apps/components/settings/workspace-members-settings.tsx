"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search, UserPlus, UserRoundPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { SettingsSectionHeader } from "@/components/settings/settings-section-header";
import { canAssignRole, getInitials } from "@/components/settings/settings-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createWorkspaceMember, deleteWorkspaceMember, provisionWorkspaceUser, updateWorkspaceMember } from "@/lib/api/members";
import type { User, Workspace, WorkspaceMember, WorkspaceMemberRole } from "@/lib/api/types";

const existingMemberSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "member", "guest"]),
});

const provisionSchema = z.object({
  email: z.string().email("Email invalide"),
  displayName: z.string().trim().min(2, "Nom requis"),
  role: z.enum(["admin", "member", "guest"]),
  temporaryPassword: z.string().min(12, "12 caractères minimum"),
});

interface WorkspaceMembersSettingsProps {
  workspace: Workspace | null;
  currentUser: User | null;
  members: WorkspaceMember[];
  actorRole: string | undefined;
  canManage: boolean;
  onMembersChange: (members: WorkspaceMember[]) => void;
}

export function WorkspaceMembersSettings({
  workspace,
  currentUser,
  members,
  actorRole,
  canManage,
  onMembersChange,
}: WorkspaceMembersSettingsProps) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [mode, setMode] = React.useState<"existing" | "provision">("existing");
  const [open, setOpen] = React.useState(false);
  const [pendingRemoval, setPendingRemoval] = React.useState<WorkspaceMember | null>(null);
  const existingForm = useForm<z.infer<typeof existingMemberSchema>>({
    resolver: zodResolver(existingMemberSchema),
    defaultValues: { email: "", role: "member" },
  });
  const provisionForm = useForm<z.infer<typeof provisionSchema>>({
    resolver: zodResolver(provisionSchema),
    defaultValues: { email: "", displayName: "", role: "member", temporaryPassword: "" },
  });

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = [member.displayName, member.email, member.role].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, roleFilter, search]);

  async function submitExisting(values: z.infer<typeof existingMemberSchema>) {
    if (!workspace) {
      return;
    }
    try {
      const created = await createWorkspaceMember(workspace.id, values);
      onMembersChange([...members, created]);
      existingForm.reset();
      setOpen(false);
      toast.success("Membre ajouté.");
    } catch {
      toast.error("Impossible d’ajouter ce membre.");
    }
  }

  async function submitProvision(values: z.infer<typeof provisionSchema>) {
    if (!workspace) {
      return;
    }
    try {
      const created = await provisionWorkspaceUser(workspace.id, values);
      onMembersChange([...members, created]);
      provisionForm.reset();
      setOpen(false);
      toast.success("Compte local provisionné.");
    } catch {
      toast.error("Provisionnement impossible.");
    }
  }

  async function handleRoleChange(member: WorkspaceMember, role: WorkspaceMemberRole) {
    if (!workspace) {
      return;
    }
    const snapshot = members;
    onMembersChange(members.map((item) => (item.userId === member.userId ? { ...item, role } : item)));
    try {
      const updated = await updateWorkspaceMember(workspace.id, member.userId, { role });
      onMembersChange(snapshot.map((item) => (item.userId === updated.userId ? updated : item)));
      toast.success("Rôle mis à jour.");
    } catch {
      onMembersChange(snapshot);
      toast.error("Mise à jour du rôle impossible.");
    }
  }

  async function confirmRemoval() {
    if (!workspace || !pendingRemoval) {
      return;
    }
    try {
      await deleteWorkspaceMember(workspace.id, pendingRemoval.userId);
      onMembersChange(members.filter((member) => member.userId !== pendingRemoval.userId));
      toast.success("Membre retiré.");
    } catch {
      toast.error("Suppression du membre impossible.");
    } finally {
      setPendingRemoval(null);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        eyebrow="Workspace"
        title="Membres"
        description={canManage ? "Ajoutez des membres existants ou provisionnez un nouveau compte local directement dans le workspace actif." : "Liste des membres du workspace en lecture seule."}
        actions={
          canManage ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="size-4" />
                  Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/10 bg-[#292a2c]">
                <DialogHeader>
                  <DialogTitle>Ajouter un membre</DialogTitle>
                  <DialogDescription>Deux modes sont disponibles: rattacher un compte existant ou provisionner un nouvel utilisateur local.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2">
                  <Button type="button" variant={mode === "existing" ? "default" : "outline"} onClick={() => setMode("existing")}>
                    <UserPlus className="size-4" />
                    Utilisateur existant
                  </Button>
                  <Button type="button" variant={mode === "provision" ? "default" : "outline"} onClick={() => setMode("provision")}>
                    <UserRoundPlus className="size-4" />
                    Nouveau compte local
                  </Button>
                </div>
                {mode === "existing" ? (
                  <Form {...existingForm}>
                    <form className="space-y-4" onSubmit={existingForm.handleSubmit((values) => void submitExisting(values))}>
                      <FormField control={existingForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} className="border-white/10 bg-[#232426]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={existingForm.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Rôle</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger className="border-white/10 bg-[#232426]"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="member">Member</SelectItem><SelectItem value="guest">Guest</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" disabled={existingForm.formState.isSubmitting}>{existingForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}Ajouter</Button>
                    </form>
                  </Form>
                ) : (
                  <Form {...provisionForm}>
                    <form className="space-y-4" onSubmit={provisionForm.handleSubmit((values) => void submitProvision(values))}>
                      <FormField control={provisionForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} className="border-white/10 bg-[#232426]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={provisionForm.control} name="displayName" render={({ field }) => (
                        <FormItem><FormLabel>Nom affiché</FormLabel><FormControl><Input {...field} className="border-white/10 bg-[#232426]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={provisionForm.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Rôle</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger className="border-white/10 bg-[#232426]"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="member">Member</SelectItem><SelectItem value="guest">Guest</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                      )} />
                      <FormField control={provisionForm.control} name="temporaryPassword" render={({ field }) => (
                        <FormItem><FormLabel>Mot de passe temporaire</FormLabel><FormControl><Input {...field} type="password" className="border-white/10 bg-[#232426]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="submit" disabled={provisionForm.formState.isSubmitting}>{provisionForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}Provisionner</Button>
                    </form>
                  </Form>
                )}
              </DialogContent>
            </Dialog>
          ) : null
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un membre" className="border-white/10 bg-black/10 pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full border-white/10 bg-black/10 sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border border-white/10 bg-black/10">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Membre</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ajouté le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.userId} className="border-white/10">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <PresenceAvatar initials={getInitials(member.displayName, member.email)} status={(member.presenceStatus as "online" | "busy" | "away" | "offline" | undefined) ?? "offline"} />
                    <div>
                      <p className="text-sm font-medium text-white">{member.displayName ?? member.userId}</p>
                      <p className="text-xs text-zinc-500">{member.email ?? "Email non disponible"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canManage && member.userId !== currentUser?.id ? (
                    <Select value={member.role} onValueChange={(value: WorkspaceMemberRole) => void handleRoleChange(member, value)}>
                      <SelectTrigger className="w-32 border-white/10 bg-[#232426]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["owner", "admin", "member", "guest"] as WorkspaceMemberRole[]).map((role) => (
                          <SelectItem key={role} value={role} disabled={!canAssignRole(actorRole, role)}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="border-white/10 text-zinc-200">{member.role}</Badge>
                  )}
                </TableCell>
                <TableCell><Badge variant="outline" className="border-white/10 text-zinc-300">{member.status ?? "active"}</Badge></TableCell>
                <TableCell className="text-xs text-zinc-400">{new Date(member.joinedAt).toLocaleString("fr-FR")}</TableCell>
                <TableCell className="text-right">
                  {canManage && member.userId !== currentUser?.id ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPendingRemoval(member)}>Retirer</Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={pendingRemoval !== null} onOpenChange={(open) => !open && setPendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action supprimera son accès au workspace actif.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRemoval()}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
