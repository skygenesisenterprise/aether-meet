import { FileText } from "lucide-react";

import { PlatformPagePlaceholder } from "@/components/platform/platform-page-placeholder";

export default function DocumentsPage() {
  return (
    <PlatformPagePlaceholder
      title="Documents"
      description="Acceder au travail documentaire actif, aux notes et aux livrables en cours."
      icon={FileText}
      primaryAction="Nouveau document"
      highlights={[
        { title: "Travail en cours", description: "Distinguer les documents de production du simple stockage." },
        { title: "Notes partagees", description: "Rassembler comptes-rendus, specs et brouillons utiles." },
        { title: "Revision", description: "Faciliter la lecture, la validation et les retours collaboratifs." },
      ]}
      nextSteps={[
        { title: "Recents", description: "Mettre en avant les documents modifies et consultes recemment." },
        { title: "Collections", description: "Organiser les contenus par usage, equipe ou projet." },
      ]}
    />
  );
}
