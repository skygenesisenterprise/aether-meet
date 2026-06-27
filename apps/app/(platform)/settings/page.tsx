import {
  Bell,
  Camera,
  Languages,
  LockKeyhole,
  Mic,
  Monitor,
  Moon,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PresenceAvatar } from "@/components/platform/presence-avatar";
import { WorkspaceHeader } from "@/components/platform/workspace-header";

interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SetingsPage() {
  return (
    <div className="flex h-full min-h-180 flex-col bg-[#232426]">
      <WorkspaceHeader
        title="Réglages"
        description="Configurez votre compte et votre expérience Aether Meet."
        icon={Settings2}
        actions={
          <Button size="sm" className="rounded-md">
            Enregistrer
          </Button>
        }
      />

      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 lg:grid-cols-[1fr_300px]">
        <section className="space-y-5">
          <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4 text-primary" />
                Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="py-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <PresenceAvatar
                  initials="LW"
                  status="online"
                  className="size-16"
                  fallbackClassName="text-lg"
                />
                <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Nom affiché</Label>
                    <Input id="display-name" defaultValue="Liam" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status-message">Message de statut</Label>
                    <Input id="status-message" defaultValue="Disponible" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="size-4 text-primary" />
                Apparence et langue
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingRow
                title="Thème"
                description="Choisissez l’apparence de l’interface de collaboration."
              >
                <Select defaultValue="dark">
                  <SelectTrigger className="w-40">
                    <Moon className="size-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow
                title="Langue"
                description="Langue utilisée dans les menus, dates et notifications."
              >
                <Select defaultValue="fr">
                  <SelectTrigger className="w-40">
                    <Languages className="size-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="size-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingRow
                title="Messages et mentions"
                description="Recevoir une alerte lorsqu’un membre vous écrit ou vous mentionne."
              >
                <Switch defaultChecked aria-label="Messages et mentions" />
              </SettingRow>
              <SettingRow
                title="Rappels de réunion"
                description="Afficher un rappel avant une réunion planifiée."
              >
                <Switch defaultChecked aria-label="Rappels de réunion" />
              </SettingRow>
              <SettingRow
                title="Sons de notification"
                description="Jouer un son pour les appels et messages entrants."
              >
                <Switch defaultChecked aria-label="Sons de notification" />
              </SettingRow>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="size-4 text-primary" />
                Audio et vidéo
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <SettingRow
                title="Caméra"
                description="Périphérique utilisé par défaut pour les réunions."
              >
                <Select defaultValue="camera">
                  <SelectTrigger className="w-48">
                    <Camera className="size-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camera">Caméra intégrée</SelectItem>
                    <SelectItem value="external">Caméra externe</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow title="Microphone" description="Source audio utilisée pour les appels.">
                <Select defaultValue="microphone">
                  <SelectTrigger className="w-48">
                    <Mic className="size-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="microphone">Microphone intégré</SelectItem>
                    <SelectItem value="headset">Casque audio</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-emerald-400" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Session protégée</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Votre compte utilise Aether Identity et une session chiffrée.
                </p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full rounded-md">
                <LockKeyhole className="size-4" />
                Gérer la sécurité
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-3 rounded-md border-white/12 bg-[#292a2c] py-0 shadow-none">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-4 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>Version</span>
                <span className="font-mono text-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Canal</span>
                <span className="text-foreground">Développement</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Région</span>
                <span className="text-foreground">Europe</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
