"use client";

import * as React from "react";
import {
  ChevronDown,
  Grid3X3,
  LogOut,
  MoreHorizontal,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
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

  return (
    <header
      className={cn(
        "relative flex h-10.5 shrink-0 items-center border-b border-white/5 bg-[#08090a] text-zinc-300",
        className
      )}
    >
      <div className="flex h-full items-center">
        <div className="flex h-full w-17 items-center justify-center">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-sm text-zinc-300 hover:bg-white/8 hover:text-white"
            aria-label="Ouvrir le lanceur d’applications Aether"
          >
            <Grid3X3 className="size-4.25" strokeWidth={1.8} />
          </Button>
        </div>

        <button
          type="button"
          className="flex h-full items-center gap-2 px-1 text-left hover:text-white"
          aria-label="Aether Meet"
        >
          <span className="relative flex size-5.5 items-center justify-center rounded-[5px] bg-linear-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm shadow-violet-950/40">
            A
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full border border-[#08090a] bg-emerald-400" />
          </span>
          <span className="hidden text-xs font-semibold tracking-tight xl:inline">Aether Meet</span>
        </button>
      </div>

      <button
        type="button"
        className="absolute left-1/2 flex h-8.5 w-[min(40vw,760px)] -translate-x-1/2 items-center gap-2 rounded-lg border border-zinc-600/70 bg-[#242527] px-6 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-[#292a2d] focus-visible:border-violet-400 focus-visible:outline-none"
        aria-label="Ouvrir la recherche globale"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="truncate">Rechercher (Ctrl+Alt+E)</span>
      </button>

      <div className="ml-auto flex h-full items-center gap-2 px-2">
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
                  <AvatarImage src={user?.avatarUrl} alt="" />
                  <AvatarFallback className="bg-violet-600 text-[10px] font-semibold text-white">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#08090a] bg-emerald-400" />
              </span>
              <ChevronDown className="hidden size-3 text-zinc-600 sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <span className="block truncate text-sm">{user?.name || "Compte Aether"}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user?.email || "connecté à Aether Identity"}
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
