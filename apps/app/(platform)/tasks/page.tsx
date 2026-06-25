import { ListTodo } from "lucide-react";

import { PlatformPagePlaceholder } from "@/components/platform/platform-page-placeholder";

export default function TasksPage() {
  return (
    <PlatformPagePlaceholder
      title="Tasks"
      description="Centraliser les actions, les assignations et les echeances de travail."
      icon={ListTodo}
      primaryAction="Nouvelle tache"
      highlights={[
        { title: "Assignation", description: "Relier une action a une personne, une equipe ou un projet." },
        { title: "Priorite", description: "Distinguer rapidement ce qui est urgent, planifie ou en attente." },
        { title: "Execution", description: "Faire le lien entre conversations, calendrier et travail concret." },
      ]}
      nextSteps={[
        { title: "Liste operative", description: "Vue compacte pour executer les taches sans friction." },
        { title: "Suivi d’avancement", description: "Etat, echeance et dependances sur chaque action." },
      ]}
    />
  );
}
