import { LayoutDashboard } from "lucide-react";

import { PlatformPagePlaceholder } from "@/components/platform/platform-page-placeholder";

export default function DashboardPage() {
  return (
    <PlatformPagePlaceholder
      title="Dashboard"
      description="Vue transversale pour suivre l’activite, les points chauds et les priorites."
      icon={LayoutDashboard}
      primaryAction="Ouvrir le suivi"
      highlights={[
        { title: "Activite", description: "Suivre les signaux importants a l’echelle du client." },
        { title: "Priorites", description: "Mettre en avant les actions qui demandent une attention immediate." },
        { title: "Pilotage", description: "Regrouper les indicateurs utiles sans changer de contexte." },
      ]}
      nextSteps={[
        { title: "Vue quotidienne", description: "Resume des conversations, reunions et livrables a surveiller." },
        { title: "Vue equipe", description: "Lecture rapide des blocages, activites et dependances." },
      ]}
    />
  );
}
