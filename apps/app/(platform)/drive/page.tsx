"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Archive,
  ArrowUpDown,
  FileChartColumn,
  FileText,
  Filter,
  FolderOpen,
  LayoutGrid,
  Presentation,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sharedFiles, type SharedFile } from "@/lib/platform-data";

const fileIcons: Record<SharedFile["kind"], typeof FileText> = {
  document: FileText,
  presentation: Presentation,
  spreadsheet: FileChartColumn,
  archive: Archive,
};

const fileColors: Record<SharedFile["kind"], string> = {
  document: "bg-blue-500/15 text-blue-300",
  presentation: "bg-orange-500/15 text-orange-300",
  spreadsheet: "bg-emerald-500/15 text-emerald-300",
  archive: "bg-violet-500/15 text-violet-300",
};

const fileKindLabels: Record<SharedFile["kind"], string> = {
  document: "Document",
  presentation: "Présentation",
  spreadsheet: "Tableur",
  archive: "Archive",
};

const fileExtensions: Record<SharedFile["kind"], string> = {
  document: "DOC",
  presentation: "PPT",
  spreadsheet: "XLS",
  archive: "ZIP",
};

const fileFilters = [
  { label: "Tout", value: "all" },
  { label: "Documents", value: "document" },
  { label: "Tableurs", value: "spreadsheet" },
  { label: "Présentations", value: "presentation" },
  { label: "Archives", value: "archive" },
] as const;

type FileFilter = (typeof fileFilters)[number]["value"];
type DriveSection = "home" | "my-files" | "shared" | "favorites" | "trash";
type SortMode = "recent" | "owner" | "name";
type ViewMode = "list" | "cards";

function sortFiles(files: SharedFile[], mode: SortMode) {
  const next = [...files];

  if (mode === "name") {
    next.sort((left, right) => left.name.localeCompare(right.name));
    return next;
  }

  if (mode === "owner") {
    next.sort((left, right) => left.owner.localeCompare(right.owner));
    return next;
  }

  return next;
}

function getSectionFiles(files: SharedFile[], section: DriveSection) {
  if (section === "my-files") {
    return files.filter((file) => file.kind !== "archive");
  }

  return files;
}

export default function DrivePage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<FileFilter>("all");
  const [sortMode, setSortMode] = React.useState<SortMode>("recent");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [selectedFileId, setSelectedFileId] = React.useState(sharedFiles[0]?.id ?? "");
  const section = (searchParams.get("section") as DriveSection | null) ?? "home";

  const visibleFiles = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sectionFiles = getSectionFiles(sharedFiles, section);

    const filtered = sectionFiles.filter((file) => {
      const matchesFilter = activeFilter === "all" || file.kind === activeFilter;
      if (!matchesFilter) return false;

      if (!normalizedQuery) return true;

      return [file.name, file.owner, file.location, fileKindLabels[file.kind]]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });

    return sortFiles(filtered, sortMode);
  }, [activeFilter, query, section, sortMode]);

  React.useEffect(() => {
    if (visibleFiles.some((file) => file.id === selectedFileId)) return;
    setSelectedFileId(visibleFiles[0]?.id ?? "");
  }, [selectedFileId, visibleFiles]);

  const selectedFile = React.useMemo(
    () => visibleFiles.find((file) => file.id === selectedFileId) ?? visibleFiles[0] ?? null,
    [selectedFileId, visibleFiles]
  );

  const ownerCount = React.useMemo(
    () => new Set(visibleFiles.map((file) => file.owner)).size,
    [visibleFiles]
  );

  const activeSection = React.useMemo(() => {
    if (section === "my-files") {
      return {
        label: "Mes fichiers",
        description: "Documents de travail actifs",
      };
    }

    if (section === "shared") {
      return {
        label: "Partagé",
        description: "Documents visibles par l’équipe",
      };
    }

    if (section === "favorites") {
      return {
        label: "Favoris",
        description: "Documents mis de côté pour accès rapide",
      };
    }

    if (section === "trash") {
      return {
        label: "Corbeille",
        description: "Éléments retirés de la vue principale",
      };
    }

    return {
      label: "Accueil",
      description: "Vue d’ensemble et accès rapide",
    };
  }, [section]);

  return (
    <div className="flex h-full min-h-180 flex-col overflow-hidden bg-[#232426]">
      <header className="flex min-h-15.5 flex-wrap items-center justify-between gap-2 border-b border-white/12 bg-[#292a2c] px-3 py-2 lg:px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="rounded-md">
            <FolderOpen className="size-4" />
            <span className="sr-only">Afficher le panneau fichiers</span>
          </Button>
          <ButtonGroup>
            <Button
              variant={sortMode === "recent" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-md"
              onClick={() => setSortMode("recent")}
            >
              Récents
            </Button>
            <Button
              variant={sortMode === "owner" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-md"
              onClick={() => setSortMode("owner")}
            >
              Propriétaire
            </Button>
            <Button
              variant={sortMode === "name" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-md"
              onClick={() => setSortMode("name")}
            >
              Nom
            </Button>
          </ButtonGroup>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative min-w-0 flex-1 md:w-80 md:flex-none">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 border-white/12 bg-[#202123] pl-9 text-sm"
              placeholder="Filtrer par nom, équipe ou personne"
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-md" onClick={() => setQuery("")}>
            <Filter className="size-4" />
            Réinitialiser
          </Button>
          <ButtonGroup>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
            >
              <SlidersHorizontal className="size-4" />
              <span className="sr-only">Vue liste</span>
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="size-4" />
              <span className="sr-only">Vue cartes</span>
            </Button>
          </ButtonGroup>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-h-0 flex-col border-r border-white/10">
          <div className="grid gap-3 border-b border-white/10 px-4 py-4 md:grid-cols-4">
            <article className="rounded-xl border border-white/10 bg-white/3 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Section</p>
              <p className="mt-2 text-lg font-semibold text-zinc-100">{activeSection.label}</p>
              <p className="mt-1 text-sm text-zinc-400">{activeSection.description}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/3 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Résultats</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{visibleFiles.length}</p>
              <p className="mt-1 text-sm text-zinc-400">fichiers visibles dans cette vue</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/3 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Propriétaires</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{ownerCount}</p>
              <p className="mt-1 text-sm text-zinc-400">collaborateurs présents dans la sélection</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/3 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Dernière activité</p>
              <p className="mt-2 text-lg font-semibold text-zinc-100">{visibleFiles[0]?.updatedAt ?? "Aucune"}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {visibleFiles[0]?.name ?? "Aucun fichier correspondant"}
              </p>
            </article>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-3">
            {fileFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "rounded-full border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/5",
                  activeFilter === filter.value && "border-violet-400/60 bg-violet-500/15 text-white"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
            {visibleFiles.length > 0 ? (
              viewMode === "list" ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#292a2c]">
                  <div className="hidden grid-cols-[minmax(260px,1.7fr)_190px_220px_140px] border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 md:grid">
                    <span>Nom</span>
                    <span>Ouvert</span>
                    <span>Propriétaire</span>
                    <span>Taille</span>
                  </div>

                  <div>
                    {visibleFiles.map((file) => {
                      const Icon = fileIcons[file.kind];
                      const isSelected = selectedFile?.id === file.id;

                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setSelectedFileId(file.id)}
                          className={cn(
                            "grid w-full gap-3 border-b border-white/10 px-4 py-4 text-left transition-colors last:border-b-0 md:grid-cols-[minmax(260px,1.7fr)_190px_220px_140px] md:px-5",
                            isSelected ? "bg-violet-500/10" : "hover:bg-white/3"
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                                fileColors[file.kind]
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-zinc-100">
                                {file.name}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-zinc-500">
                                {file.location} · {fileKindLabels[file.kind]}
                              </span>
                            </span>
                          </span>
                          <span className="text-sm text-zinc-400">{file.updatedAt}</span>
                          <span className="text-sm text-zinc-400">{file.owner}</span>
                          <span className="text-sm text-zinc-500">{file.size}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {visibleFiles.map((file) => {
                    const Icon = fileIcons[file.kind];
                    const isSelected = selectedFile?.id === file.id;

                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setSelectedFileId(file.id)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-colors",
                          isSelected
                            ? "border-violet-400/45 bg-violet-500/10"
                            : "border-white/10 bg-white/3 hover:bg-white/4"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={cn(
                              "flex size-11 shrink-0 items-center justify-center rounded-xl",
                              fileColors[file.kind]
                            )}
                          >
                            <Icon className="size-5" />
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                            {fileExtensions[file.kind]}
                          </span>
                        </div>
                        <p className="mt-4 text-sm font-semibold text-zinc-100">{file.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">{file.location}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                          <span>{file.owner}</span>
                          <span>{file.updatedAt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-5">
                <p className="text-sm font-medium text-zinc-200">Aucun fichier trouvé</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Ajuste la recherche ou change le filtre pour retrouver un document.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden bg-[#252628]">
          <div className="shrink-0 border-b border-white/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Sélection</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-100">
              {selectedFile?.name ?? "Aucun fichier"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {selectedFile ? `${fileKindLabels[selectedFile.kind]} · ${selectedFile.size}` : "Aucun élément à afficher"}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            {selectedFile ? (
              <div className="space-y-4">
                <article className="rounded-xl border border-white/10 bg-white/3 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl",
                        fileColors[selectedFile.kind]
                      )}
                    >
                      {React.createElement(fileIcons[selectedFile.kind], { className: "size-5" })}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-100">{selectedFile.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{selectedFile.location}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm">Ouvrir</Button>
                    <Button variant="outline" size="sm">
                      Partager
                    </Button>
                  </div>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/3 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Détails</p>
                  <dl className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-zinc-500">Type</dt>
                      <dd className="text-zinc-200">{fileKindLabels[selectedFile.kind]}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-zinc-500">Extension</dt>
                      <dd className="text-zinc-200">{fileExtensions[selectedFile.kind]}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-zinc-500">Propriétaire</dt>
                      <dd className="text-zinc-200">{selectedFile.owner}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-zinc-500">Activité</dt>
                      <dd className="text-zinc-200">{selectedFile.updatedAt}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-zinc-500">Poids</dt>
                      <dd className="text-zinc-200">{selectedFile.size}</dd>
                    </div>
                  </dl>
                </article>

                <article className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                  <p className="text-sm font-medium text-zinc-200">Contexte d’utilisation</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Cette vue garde la sélection, les filtres et la recherche visibles pour réduire les allers-retours dans la liste.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                    <ArrowUpDown className="size-3.5" />
                    <span>Tri rapide sans changer le contenu affiché</span>
                  </div>
                </article>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/12 bg-black/10 p-4">
                <p className="text-sm font-medium text-zinc-200">Aucune sélection</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Choisis un fichier dans la liste pour afficher ses détails.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
