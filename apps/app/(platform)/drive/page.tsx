import { Archive, FileChartColumn, FileText, Filter, Presentation, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  document: "bg-blue-500/15 text-blue-400",
  presentation: "bg-orange-500/15 text-orange-400",
  spreadsheet: "bg-emerald-500/15 text-emerald-400",
  archive: "bg-violet-500/15 text-violet-400",
};

const fileFilters = [
  { label: "Tout", active: true },
  { label: "Documents", tone: "bg-blue-500" },
  { label: "Tableurs", tone: "bg-emerald-500" },
  { label: "Présentations", tone: "bg-orange-500" },
  { label: "PDF", tone: "bg-rose-500" },
];

export default function DrivePage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <header className="flex min-h-15.5 shrink-0 flex-wrap items-center gap-2 border-b border-white/12 bg-[#292a2c] px-4 py-2">
        <h1 className="mr-1 text-sm font-semibold">Récent</h1>
        <div className="flex flex-wrap items-center gap-2">
          {fileFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={cn(
                "flex h-8 items-center gap-2 rounded-full border border-zinc-600 px-3 text-sm text-zinc-200 transition-colors hover:bg-white/5",
                filter.active && "border-[#7775ff] bg-[#7775ff]/15 text-white"
              )}
            >
              {filter.tone ? <span className={cn("size-3 rounded-sm", filter.tone)} /> : null}
              {filter.label}
            </button>
          ))}
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="size-4" />
            Autres
          </Button>
        </div>

        <div className="relative ml-auto min-w-60">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          <Input
            className="h-8 rounded-sm border-white/12 bg-[#202123] pl-9 text-xs"
            placeholder="Filtrer par nom ou par personne"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
        <div className="min-w-190 overflow-hidden rounded-sm border border-white/12 bg-[#292a2c]">
          <div className="grid grid-cols-[minmax(300px,1.7fr)_200px_260px_1fr] border-b border-white/12 px-5 py-3 text-sm font-semibold text-zinc-100">
            <span>Nom</span>
            <span>Ouvert</span>
            <span>Propriétaire</span>
            <span>Activité</span>
          </div>

          <div>
            {sharedFiles.map((file, index) => {
              const Icon = fileIcons[file.kind];

              return (
                <button
                  key={file.id}
                  type="button"
                  className="grid w-full grid-cols-[minmax(300px,1.7fr)_200px_260px_1fr] items-center border-b border-white/10 px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-white/2.5"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-sm",
                        fileColors[file.kind]
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-100">
                        {file.name}
                      </span>
                      <span className="block truncate text-[11px] text-zinc-500">
                        {file.location}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm text-zinc-400">
                    {index === 0 ? "Aujourd’hui" : file.updatedAt}
                  </span>
                  <span className="truncate text-sm text-zinc-400">{file.owner}</span>
                  <span className="text-xs text-zinc-500">{file.size}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
