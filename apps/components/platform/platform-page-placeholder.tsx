import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { WorkspaceHeader } from "@/components/platform/workspace-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderItem {
  title: string;
  description: string;
}

interface PlatformPagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  primaryAction: string;
  highlights: PlaceholderItem[];
  nextSteps: PlaceholderItem[];
}

export function PlatformPagePlaceholder({
  title,
  description,
  icon,
  primaryAction,
  highlights,
  nextSteps,
}: PlatformPagePlaceholderProps) {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <WorkspaceHeader
        title={title}
        description={description}
        icon={icon}
        actions={
          <Button size="sm" className="rounded-md">
            {primaryAction}
            <ArrowRight className="size-4" />
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <Card
                  key={item.title}
                  className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
              <CardHeader className="border-b py-4">
                <CardTitle className="text-base">Vue de travail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                {nextSteps.map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/10 bg-white/3 p-4">
                    <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <aside>
            <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
              <CardHeader className="border-b py-4">
                <CardTitle className="text-base">Contexte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-4 text-sm text-zinc-400">
                <p>
                  Cette page a ete ajoutee a la navigation pour preparer un client plus complet et
                  plus coherent.
                </p>
                <p>
                  Elle sert de point d’entree exploitable en attendant son flux produit complet.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
