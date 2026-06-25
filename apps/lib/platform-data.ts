import {
  Bell,
  CalendarDays,
  Files,
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

export interface Conversation {
  id: string;
  name: string;
  initials: string;
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
  { label: "Accueil", href: "/home", icon: Sparkles },
  { label: "Activité", href: "/notifications", icon: Bell, badge: 5 },
  { label: "Conversations", href: "/chat", icon: MessageCircleMore, badge: 4 },
  { label: "Équipes", href: "/teams", icon: UsersRound },
  { label: "Calendrier", href: "/calendar", icon: CalendarDays },
  { label: "Appels", href: "/calls", icon: Phone, badge: 2 },
  { label: "Fichiers", href: "/drive", icon: Files },
  { label: "Réglages", href: "/setings", icon: Settings2 },
];

export const people: Person[] = [
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
    preview: "Je pousse la correction après la revue.",
    time: "08:15",
    unread: 1,
    status: "busy",
  },
  {
    id: "launch",
    name: "Lancement Aether",
    initials: "LA",
    preview: "Sarah : Réunion déplacée à 15 h.",
    time: "Hier",
    status: "online",
  },
  {
    id: "security",
    name: "Sécurité & conformité",
    initials: "SC",
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

export const recentMessages = [
  {
    id: "m1",
    author: "Elena Martin",
    initials: "EM",
    time: "09:36",
    content:
      "J’ai terminé la nouvelle direction du client. Le shell est plus compact et le contexte reste visible pendant la navigation.",
  },
  {
    id: "m2",
    author: "Marcus Chen",
    initials: "MC",
    time: "09:39",
    content:
      "La séparation rail, panneau contextuel et espace actif est compatible avec nos routes actuelles. Je prépare les contrats API.",
  },
  {
    id: "m3",
    author: "Elena Martin",
    initials: "EM",
    time: "09:42",
    content: "Parfait. Je joins les états mobile et réunion active avant la revue de 15 h.",
  },
] as const;
