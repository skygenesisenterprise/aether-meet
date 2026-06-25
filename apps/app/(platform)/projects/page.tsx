import { FolderKanban } from "lucide-react";

import { PlatformPagePlaceholder } from "@/components/platform/platform-page-placeholder";

export default function ProjectsPage() {
  return (
    <PlatformPagePlaceholder
      title="Projects"
      description="Piloter les initiatives transverses entre equipes, livrables et ressources."
      icon={FolderKanban}
      primaryAction="Nouveau projet"
      highlights={[
        { title: "Coordination", description: "Regrouper les equipes, taches et documents autour d’un meme effort." },
        { title: "Vision", description: "Lire la progression globale d’une initiative sans changer de page." },
        { title: "Priorisation", description: "Arbitrer les projets en cours selon leur impact et leur charge." },
      ]}
      nextSteps={[
        { title: "Portefeuille", description: "Vue des projets actifs, en pause ou a lancer." },
        { title: "Detail projet", description: "Membres, canaux, fichiers et cadence de pilotage reunis." },
      ]}
    />
  );
}
