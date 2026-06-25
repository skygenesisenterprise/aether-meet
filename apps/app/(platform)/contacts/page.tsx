import { ContactRound } from "lucide-react";

import { PlatformPagePlaceholder } from "@/components/platform/platform-page-placeholder";

export default function ContactsPage() {
  return (
    <PlatformPagePlaceholder
      title="Contacts"
      description="Trouver rapidement les personnes, les roles et les points de contact utiles."
      icon={ContactRound}
      primaryAction="Ajouter un contact"
      highlights={[
        { title: "Annuaire", description: "Afficher les personnes, roles, disponibilites et rattachements." },
        { title: "Acces rapide", description: "Lancer une conversation, un appel ou une recherche contextuelle." },
        { title: "Contexte humain", description: "Rendre les equipes plus lisibles a l’echelle du client." },
      ]}
      nextSteps={[
        { title: "Recherche personne", description: "Trouver un profil a partir d’un nom, role ou equipe." },
        { title: "Fiche contact", description: "Centraliser les informations utiles avant une prise de contact." },
      ]}
    />
  );
}
