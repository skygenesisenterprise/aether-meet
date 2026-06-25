import { BookOpenText } from "lucide-react";

import { PlatformPagePlaceholder } from "@/components/platform/platform-page-placeholder";

export default function ResourcesPage() {
  return (
    <PlatformPagePlaceholder
      title="Resources"
      description="Rassembler la base de connaissance, les guides et les contenus de reference."
      icon={BookOpenText}
      primaryAction="Nouvelle ressource"
      highlights={[
        { title: "Connaissance", description: "Donner un point d’entree clair vers la documentation interne." },
        { title: "Runbooks", description: "Conserver les procedures, guides et bonnes pratiques utiles." },
        { title: "Transmission", description: "Aider l’onboarding et la circulation de l’information durable." },
      ]}
      nextSteps={[
        { title: "Bibliotheque", description: "Classer les ressources par domaine, equipe ou niveau de criticite." },
        { title: "Aide contextuelle", description: "Relier directement les ressources aux espaces de travail du client." },
      ]}
    />
  );
}
