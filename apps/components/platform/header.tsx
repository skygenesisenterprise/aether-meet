"use client";

import * as React from "react";
import {
  ChevronDown,
  LogOut,
  MoreHorizontal,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { usePlatform } from "@/context/PlatformContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  className?: string;
}

function getInitials(name?: string) {
  if (!name) return "AM";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminHeader({ className }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { activeWorkspace, activeWorkspaceId, currentUser, setActiveWorkspaceId, workspaces } = usePlatform();
  const resolvedUser = currentUser ?? user;

  return (
    <header
      className={cn(
        "relative flex h-10.5 shrink-0 items-center border-b border-white/5 bg-[#232426] text-zinc-300",
        className
      )}
    >

      <button
        type="button"
        className="absolute left-1/2 flex h-8.5 w-[min(40vw,760px)] -translate-x-1/2 items-center gap-2 rounded-lg border border-zinc-600/70 bg-[#242527] px-6 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-[#292a2d] focus-visible:border-violet-400 focus-visible:outline-none"
        aria-label="Ouvrir la recherche globale"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="truncate">Rechercher (Ctrl+Alt+E)</span>
      </button>

      <div className="ml-auto flex h-full items-center gap-2 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hidden h-8 gap-2 rounded-sm px-2 text-xs text-zinc-300 hover:bg-white/8 hover:text-white md:inline-flex"
              aria-label="Changer de workspace"
            >
              <span className="max-w-44 truncate">{activeWorkspace?.name ?? "Aucun workspace"}</span>
              <ChevronDown className="size-3 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => setActiveWorkspaceId(workspace.id)}
                className={workspace.id === activeWorkspaceId ? "bg-accent" : undefined}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm">{workspace.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{workspace.slug}</div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 rounded-sm text-zinc-400 hover:bg-white/8 hover:text-white"
          aria-label="Plus d’options"
        >
          <MoreHorizontal className="size-4.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-0.5 rounded-sm px-0.5 text-zinc-300 hover:bg-white/8 hover:text-white"
              aria-label="Ouvrir le menu du compte"
            >
              <span className="relative">
                <Avatar className="size-7">
                  <AvatarImage src={resolvedUser?.avatarUrl} alt="" />
                  <AvatarFallback className="bg-violet-600 text-[10px] font-semibold text-white">
                    {getInitials(resolvedUser?.displayName ?? resolvedUser?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#232426] bg-emerald-400" />
              </span>
              <ChevronDown className="hidden size-3 text-zinc-600 sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <span className="block truncate text-sm">{resolvedUser?.displayName ?? resolvedUser?.name ?? "Compte Aether"}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {resolvedUser?.email || "connecté à Aether Identity"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound className="size-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" />
              Réglages
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => void logout()}>
              <LogOut className="size-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
