import {
  Bell,
  BookOpenText,
  CalendarDays,
  ContactRound,
  FileText,
  FolderKanban,
  Cloud,
  House,
  ListTodo,
  MessageCircleMore,
  Phone,
  Settings2,
  Sparkles,
  UsersRound,
} from "lucide-react";

export interface PlatformNavItem {
  label: string;
  href: string;
  icon: typeof Sparkles;
  badge?: number;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: "online" | "busy" | "away" | "offline";
}

export interface ChatMessage {
  id: string;
  authorId: string;
  author: string;
  initials: string;
  time: string;
  content: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  type: "channel" | "dm";
  memberIds: string[];
  subtitle: string;
  preview: string;
  time: string;
  unread?: number;
  active?: boolean;
  status: Person["status"];
}

export interface Meeting {
  id: string;
  title: string;
  start: string;
  end: string;
  day: string;
  participants: string[];
  status: "live" | "upcoming" | "done";
  location?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  channels: string[];
  color: string;
}

export interface SharedFile {
  id: string;
  name: string;
  kind: "document" | "presentation" | "spreadsheet" | "archive";
  owner: string;
  location: string;
  updatedAt: string;
  size: string;
}

export const platformNavItems: PlatformNavItem[] = [
  { label: "Activité", href: "/notifications", icon: Bell, badge: 5 },
  { label: "Conversations", href: "/chat", icon: MessageCircleMore, badge: 4 },
  { label: "Tâches", href: "/tasks", icon: ListTodo },
  { label: "Projets", href: "/projects", icon: FolderKanban },
  { label: "Équipes", href: "/teams", icon: UsersRound },
  { label: "Calendrier", href: "/calendar", icon: CalendarDays },
  { label: "Appels", href: "/calls", icon: Phone, badge: 2 },
  { label: "Drive", href: "/drive", icon: Cloud },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Contacts", href: "/contacts", icon: ContactRound },
  { label: "Ressources", href: "/resources", icon: BookOpenText },
  { label: "Réglages", href: "/setings", icon: Settings2 },
];

export const people: Person[] = [
  {
    id: "liam",
    name: "Liam Ward",
    initials: "LW",
    role: "Product lead",
    status: "online",
  },
  {
    id: "elena",
    name: "Elena Martin",
    initials: "EM",
    role: "Product designer",
    status: "online",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    initials: "MC",
    role: "Lead engineer",
    status: "busy",
  },
  {
    id: "sarah",
    name: "Sarah Kim",
    initials: "SK",
    role: "Operations",
    status: "away",
  },
  {
    id: "noah",
    name: "Noah Williams",
    initials: "NW",
    role: "Security",
    status: "offline",
  },
];

export const conversations: Conversation[] = [
  {
    id: "product",
    name: "Équipe produit",
    initials: "EP",
    type: "channel",
    memberIds: ["liam", "elena", "marcus", "sarah"],
    subtitle: "8 membres · 4 en ligne",
    preview: "Elena : La nouvelle maquette est prête.",
    time: "09:42",
    unread: 3,
    active: true,
    status: "online",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    initials: "MC",
    type: "dm",
    memberIds: ["liam", "marcus"],
    subtitle: "En ligne",
    preview: "Je pousse la correction après la revue.",
    time: "08:15",
    unread: 1,
    status: "busy",
  },
  {
    id: "launch",
    name: "Lancement Aether",
    initials: "LA",
    type: "channel",
    memberIds: ["liam", "elena", "sarah"],
    subtitle: "12 membres · 2 en ligne",
    preview: "Sarah : Réunion déplacée à 15 h.",
    time: "Hier",
    status: "online",
  },
  {
    id: "security",
    name: "Sécurité & conformité",
    initials: "SC",
    type: "channel",
    memberIds: ["liam", "marcus", "noah"],
    subtitle: "6 membres · 1 en ligne",
    preview: "Noah a partagé un document.",
    time: "Lun.",
    status: "away",
  },
];

export const meetings: Meeting[] = [
  {
    id: "daily",
    title: "Point produit quotidien",
    start: "10:00",
    end: "10:30",
    day: "Aujourd’hui",
    participants: ["EM", "MC", "SK", "NW"],
    status: "upcoming",
    location: "Canal Équipe produit",
  },
  {
    id: "design",
    title: "Revue du nouveau client",
    start: "15:00",
    end: "16:00",
    day: "Aujourd’hui",
    participants: ["EM", "MC", "LW"],
    status: "live",
    location: "Salle Aether",
  },
  {
    id: "security",
    title: "Comité sécurité",
    start: "09:30",
    end: "10:15",
    day: "Demain",
    participants: ["NW", "MC"],
    status: "upcoming",
    location: "Confidentiel",
  },
  {
    id: "roadmap",
    title: "Roadmap trimestrielle",
    start: "14:00",
    end: "15:30",
    day: "Vendredi",
    participants: ["EM", "MC", "SK", "NW", "LW"],
    status: "upcoming",
    location: "Tous les collaborateurs",
  },
];

export const teams: Team[] = [
  {
    id: "product",
    name: "Produit",
    description: "Design, recherche utilisateur et feuille de route Aether.",
    members: 12,
    channels: ["Général", "Design", "Recherche", "Annonces"],
    color: "from-violet-500 to-indigo-500",
  },
  {
    id: "engineering",
    name: "Ingénierie",
    description: "Architecture, développement client et infrastructure temps réel.",
    members: 18,
    channels: ["Général", "Web", "Backend", "Infrastructure"],
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "operations",
    name: "Opérations",
    description: "Déploiements, support, sécurité et gouvernance.",
    members: 9,
    channels: ["Général", "Incidents", "Sécurité"],
    color: "from-emerald-500 to-teal-600",
  },
];

export const sharedFiles: SharedFile[] = [
  {
    id: "spec",
    name: "Spécification client Aether Meet",
    kind: "document",
    owner: "Elena Martin",
    location: "Équipe produit",
    updatedAt: "Il y a 18 min",
    size: "2,4 Mo",
  },
  {
    id: "roadmap",
    name: "Roadmap plateforme 2026",
    kind: "presentation",
    owner: "Sarah Kim",
    location: "Lancement Aether",
    updatedAt: "Hier",
    size: "8,1 Mo",
  },
  {
    id: "capacity",
    name: "Capacité infrastructure",
    kind: "spreadsheet",
    owner: "Marcus Chen",
    location: "Ingénierie",
    updatedAt: "Mardi",
    size: "740 Ko",
  },
  {
    id: "assets",
    name: "Assets de marque",
    kind: "archive",
    owner: "Elena Martin",
    location: "Design",
    updatedAt: "12 juin",
    size: "34 Mo",
  },
];

export const conversationMessages: Record<string, ChatMessage[]> = {
  product: [
    {
      id: "m1",
      authorId: "elena",
      author: "Elena Martin",
      initials: "EM",
      time: "09:36",
      content:
        "J’ai terminé la nouvelle direction du client. Le shell est plus compact et le contexte reste visible pendant la navigation.",
    },
    {
      id: "m2",
      authorId: "marcus",
      author: "Marcus Chen",
      initials: "MC",
      time: "09:39",
      content:
        "La séparation rail, panneau contextuel et espace actif est compatible avec nos routes actuelles. Je prépare les contrats API.",
    },
    {
      id: "m3",
      authorId: "liam",
      author: "Liam Ward",
      initials: "LW",
      time: "09:42",
      content: "Parfait. Je prends la version de Elena pour la revue et je valide le flux mobile avant 15 h.",
    },
  ],
  marcus: [
    {
      id: "mc1",
      authorId: "marcus",
      author: "Marcus Chen",
      initials: "MC",
      time: "08:00",
      content: "Tu peux review la PR quand tu as un moment ?",
    },
    {
      id: "mc2",
      authorId: "liam",
      author: "Liam Ward",
      initials: "LW",
      time: "08:15",
      content: "Oui, je passe dessus après le point produit. Je te laisse la correction si je vois autre chose.",
    },
  ],
  launch: [
    {
      id: "lc1",
      authorId: "sarah",
      author: "Sarah Kim",
      initials: "SK",
      time: "14:30",
      content: "La réunion de lancement est déplacée à 15 h.",
    },
    {
      id: "lc2",
      authorId: "liam",
      author: "Liam Ward",
      initials: "LW",
      time: "14:45",
      content: "J’ai mis à jour le deck avec les nouvelles slides et la séquence d’ouverture.",
    },
    {
      id: "lc3",
      authorId: "sarah",
      author: "Sarah Kim",
      initials: "SK",
      time: "Hier",
      content: "Parfait, on se retrouve à 15 h.",
    },
  ],
  security: [
    {
      id: "sc1",
      authorId: "noah",
      author: "Noah Williams",
      initials: "NW",
      time: "Lun.",
      content: "J’ai partagé un document sur les nouvelles exigences de conformité.",
    },
    {
      id: "sc2",
      authorId: "liam",
      author: "Liam Ward",
      initials: "LW",
      time: "Lun.",
      content: "Merci, je relis ça aujourd’hui et je reviens avec la liste des impacts côté produit.",
    },
    {
      id: "sc3",
      authorId: "noah",
      author: "Noah Williams",
      initials: "NW",
      time: "Lun.",
      content: "Il faudrait finaliser avant vendredi si possible.",
    },
  ],
};

export const recentMessages = [
  {
    id: "m1",
    authorId: "elena",
    author: "Elena Martin",
    initials: "EM",
    time: "09:36",
    content:
      "J’ai terminé la nouvelle direction du client. Le shell est plus compact et le contexte reste visible pendant la navigation.",
  },
  {
    id: "m2",
    authorId: "marcus",
    author: "Marcus Chen",
    initials: "MC",
    time: "09:39",
    content:
      "La séparation rail, panneau contextuel et espace actif est compatible avec nos routes actuelles. Je prépare les contrats API.",
  },
  {
    id: "m3",
    authorId: "liam",
    author: "Liam Ward",
    initials: "LW",
    time: "09:42",
    content: "Parfait. Je prends la version de Elena pour la revue et je valide le flux mobile avant 15 h.",
  },
] as const;

export const currentUser = people[0];
