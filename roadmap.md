# Roadmap client platform -> API

## Objectif

Analyser `apps/app/(platform)` et définir les endpoints à introduire côté client en s'appuyant d'abord sur ce qui existe déjà dans `server/src/routes/routes.go`.

## Constat actuel

- Les pages de `apps/app/(platform)` sont majoritairement alimentées par des mocks locaux.
- Le chat utilise un store Zustand local dans `apps/lib/chat-store.ts`.
- Le shell platform (`apps/components/platform/platform-shell.tsx`) n'appelle pas encore les routes métier de `routes.go`.
- La recherche globale ne fait rien pour l'instant.
- Aucune intégration client n'utilise actuellement les routes workspace / teams / channels / conversations / meetings / applications / audit logs / realtime exposées par `server/src/routes/routes.go`.

## Routes déjà disponibles côté serveur

### Contexte utilisateur et workspace

- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/workspaces`
- `POST /api/v1/workspaces`
- `GET /api/v1/workspaces/:workspaceId`
- `PATCH /api/v1/workspaces/:workspaceId`
- `DELETE /api/v1/workspaces/:workspaceId`
- `GET /api/v1/workspaces/:workspaceId/members`
- `POST /api/v1/workspaces/:workspaceId/members`
- `PATCH /api/v1/workspaces/:workspaceId/members/:userId`
- `DELETE /api/v1/workspaces/:workspaceId/members/:userId`

### Teams et channels

- `GET /api/v1/workspaces/:workspaceId/teams`
- `POST /api/v1/workspaces/:workspaceId/teams`
- `GET /api/v1/teams/:teamId`
- `PATCH /api/v1/teams/:teamId`
- `DELETE /api/v1/teams/:teamId`
- `GET /api/v1/workspaces/:workspaceId/channels`
- `POST /api/v1/workspaces/:workspaceId/channels`
- `GET /api/v1/channels/:channelId`
- `PATCH /api/v1/channels/:channelId`
- `DELETE /api/v1/channels/:channelId`

### Conversations et messages

- `GET /api/v1/workspaces/:workspaceId/conversations`
- `POST /api/v1/workspaces/:workspaceId/conversations`
- `GET /api/v1/conversations/:conversationId`
- `PATCH /api/v1/conversations/:conversationId`
- `DELETE /api/v1/conversations/:conversationId`
- `GET /api/v1/conversations/:conversationId/messages?cursor=&limit=`
- `POST /api/v1/conversations/:conversationId/messages`
- `POST /api/v1/conversations/:conversationId/read`
- `GET /api/v1/messages/:messageId`
- `PATCH /api/v1/messages/:messageId`
- `DELETE /api/v1/messages/:messageId`
- `POST /api/v1/messages/:messageId/reactions`
- `DELETE /api/v1/messages/:messageId/reactions/:emoji`

### Meetings et appels

- `GET /api/v1/workspaces/:workspaceId/meetings`
- `POST /api/v1/workspaces/:workspaceId/meetings`
- `GET /api/v1/meetings/:meetingId`
- `POST /api/v1/meetings/:meetingId/start`
- `POST /api/v1/meetings/:meetingId/end`
- `POST /api/v1/meetings/:meetingId/join-token`

### Applications et audit

- `GET /api/v1/workspaces/:workspaceId/applications`
- `POST /api/v1/workspaces/:workspaceId/applications`
- `GET /api/v1/applications/:applicationId`
- `PATCH /api/v1/applications/:applicationId`
- `DELETE /api/v1/applications/:applicationId`
- `GET /api/v1/workspaces/:workspaceId/audit-logs`
- `GET /api/v1/realtime/ws`

## Payloads utiles déjà définis par `routes.go`

### `PATCH /api/v1/me`

```json
{
  "displayName": "string",
  "avatarUrl": "string",
  "status": "string"
}
```

### `POST /api/v1/workspaces/:workspaceId/teams`

```json
{
  "name": "string",
  "description": "string"
}
```

### `POST /api/v1/workspaces/:workspaceId/channels`

```json
{
  "teamId": "string | null",
  "name": "string",
  "slug": "string",
  "description": "string",
  "type": "string",
  "visibility": "string"
}
```

### `POST /api/v1/workspaces/:workspaceId/conversations`

```json
{
  "type": "dm | channel",
  "name": "string",
  "memberIds": ["user-id"]
}
```

### `POST /api/v1/conversations/:conversationId/messages`

```json
{
  "type": "text",
  "content": "string",
  "metadata": {}
}
```

Notes:

- Le header `Idempotency-Key` est supporté pour la création de message.
- `POST /api/v1/conversations/:conversationId/read` attend `{ "messageId": "..." }`.

### `POST /api/v1/workspaces/:workspaceId/meetings`

```json
{
  "title": "string",
  "conversationId": "string | null"
}
```

### `POST /api/v1/workspaces/:workspaceId/applications`

```json
{
  "provider": "string",
  "name": "string",
  "configuration": {}
}
```

## Analyse par page `apps/app/(platform)`

### `layout.tsx`

Besoin client:

- Charger l'utilisateur courant.
- Charger le workspace actif.
- Centraliser la résolution de `workspaceId`.
- Préparer une connexion temps réel partagée.

Endpoints à brancher:

- `GET /api/v1/me`
- `GET /api/v1/workspaces`
- `GET /api/v1/workspaces/:workspaceId`
- `GET /api/v1/realtime/ws`

### `notifications/page.tsx`

Constat:

- Vue totalement mockée.
- Aucun endpoint correspondant dans `routes.go`.

Conclusion:

- Aucun endpoint existant à brancher depuis `routes.go`.
- Backend manquant pour une vraie boîte de notifications.

### `chat/page.tsx`

Constat:

- Les conversations et messages proviennent de `apps/lib/platform-data.ts`.
- La création de conversation et l'envoi de message sont purement locaux via `apps/lib/chat-store.ts`.
- Le panneau latéral de conversations est dans `apps/components/platform/context-panel.tsx`.

Endpoints à brancher en priorité:

- `GET /api/v1/workspaces/:workspaceId/conversations`
- `POST /api/v1/workspaces/:workspaceId/conversations`
- `GET /api/v1/conversations/:conversationId`
- `PATCH /api/v1/conversations/:conversationId`
- `DELETE /api/v1/conversations/:conversationId`
- `GET /api/v1/conversations/:conversationId/messages`
- `POST /api/v1/conversations/:conversationId/messages`
- `POST /api/v1/conversations/:conversationId/read`
- `PATCH /api/v1/messages/:messageId`
- `DELETE /api/v1/messages/:messageId`
- `POST /api/v1/messages/:messageId/reactions`
- `DELETE /api/v1/messages/:messageId/reactions/:emoji`
- `GET /api/v1/realtime/ws`

Travail client attendu:

- Remplacer `platform-data` et `chat-store` comme source principale.
- Introduire pagination des messages via `cursor`.
- Ajouter synchronisation temps réel des nouveaux messages, lectures et réactions.
- Marquer lu à l'ouverture ou au scroll de la conversation.

### `calendar/page.tsx`

Constat:

- Le calendrier est construit à partir des mocks `meetings`.
- La création d'événement reste locale.
- Le bouton de lancement renvoie vers `/calls/room`.

Endpoints à brancher:

- `GET /api/v1/workspaces/:workspaceId/meetings`
- `POST /api/v1/workspaces/:workspaceId/meetings`
- `GET /api/v1/meetings/:meetingId`
- `POST /api/v1/meetings/:meetingId/start`
- `POST /api/v1/meetings/:meetingId/end`
- `POST /api/v1/meetings/:meetingId/join-token`

Limites actuelles serveur:

- Le create meeting n'accepte pas encore `start`, `end`, `participants`, `location`.
- Le calendrier UI expose plus d'information que le contrat create actuel.

### `calls/page.tsx`

Constat:

- Historique d'appels mocké.
- Filtres "manqués", "entrant", "sortant", "messagerie vocale" sans backend.

Endpoints existants exploitables partiellement:

- `GET /api/v1/workspaces/:workspaceId/meetings`
- `GET /api/v1/meetings/:meetingId`
- `POST /api/v1/meetings/:meetingId/start`
- `POST /api/v1/meetings/:meetingId/end`
- `POST /api/v1/meetings/:meetingId/join-token`

Écart produit:

- `routes.go` couvre la réunion, pas l'historique téléphonie, les appels manqués ni la messagerie vocale.

### `contacts/page.tsx`

Constat:

- La page affiche `people` en local.
- Les groupes de contacts sont mockés.

Endpoints existants potentiellement réutilisables:

- `GET /api/v1/workspaces/:workspaceId/members`
- `POST /api/v1/workspaces/:workspaceId/members`
- `PATCH /api/v1/workspaces/:workspaceId/members/:userId`
- `DELETE /api/v1/workspaces/:workspaceId/members/:userId`

Écart produit:

- Pas de notion serveur de carnet de contacts ni de groupes de contacts dans `routes.go`.
- La page pourra démarrer en mode "annuaire workspace" avant d'avoir un vrai domaine contacts.

### `documents/page.tsx`

Constat:

- Vue 100% mockée.
- Aucun endpoint document dans `routes.go`.

Conclusion:

- Aucun endpoint existant à brancher depuis `routes.go`.

### `drive/page.tsx`

Constat:

- Vue de fichiers 100% mockée.
- Aucun endpoint drive/file dans `routes.go`.

Conclusion:

- Aucun endpoint existant à brancher depuis `routes.go`.

### `projects/page.tsx`

Constat:

- Vue portefeuille 100% mockée.
- Aucun endpoint projet dans `routes.go`.

Conclusion:

- Aucun endpoint existant à brancher depuis `routes.go`.

### `resources/page.tsx`

Constat:

- Bibliothèque 100% mockée.
- Aucun endpoint ressource / knowledge dans `routes.go`.

Conclusion:

- Aucun endpoint existant à brancher depuis `routes.go`.

### `setings/page.tsx`

Constat:

- L'écran contient un vrai besoin de profil utilisateur.
- Le reste des préférences affichées n'a pas de backend dans `routes.go`.

Endpoints à brancher:

- `GET /api/v1/me`
- `PATCH /api/v1/me`

Écart produit:

- Pas d'endpoint dédié pour thème, langue, notifications, audio/vidéo, sécurité applicative dans `routes.go`.

### `tasks/page.tsx`

Constat:

- Kanban de tâches 100% mocké.
- Aucun endpoint task dans `routes.go`.

Conclusion:

- Aucun endpoint existant à brancher depuis `routes.go`.

### `teams/page.tsx`

Constat:

- La création d'équipe est locale.
- Les canaux sont dérivés des mocks `teams`.
- La page lie visuellement équipes, canaux, membres et conversation.

Endpoints à brancher:

- `GET /api/v1/workspaces/:workspaceId/teams`
- `POST /api/v1/workspaces/:workspaceId/teams`
- `GET /api/v1/teams/:teamId`
- `PATCH /api/v1/teams/:teamId`
- `DELETE /api/v1/teams/:teamId`
- `GET /api/v1/workspaces/:workspaceId/channels`
- `POST /api/v1/workspaces/:workspaceId/channels`
- `GET /api/v1/channels/:channelId`
- `PATCH /api/v1/channels/:channelId`
- `DELETE /api/v1/channels/:channelId`
- `GET /api/v1/workspaces/:workspaceId/members`
- `GET /api/v1/workspaces/:workspaceId/conversations`

Points d'attention:

- Le front affiche des channels imbriqués sous une équipe. L'API channel permet bien un `teamId`.
- Il faudra définir côté client la jointure `team -> channels -> linked conversation`.
- Le bouton "ouvrir la conversation" suppose un mapping métier entre team et conversation qui n'est pas explicite dans `routes.go`.

## Priorisation recommandée

### Phase 1 - Fondations client

Objectif:

- Rendre le shell platform conscient du user et du workspace actif.

À faire:

- Créer un client API dédié platform, par exemple `apps/lib/api/platform.ts`.
- Introduire une résolution du workspace courant.
- Brancher `GET /api/v1/me`.
- Brancher `GET /api/v1/workspaces`.
- Brancher `GET /api/v1/workspaces/:workspaceId`.
- Préparer un provider temps réel basé sur `GET /api/v1/realtime/ws`.

### Phase 2 - Chat complet

Objectif:

- Remplacer la pile mock locale par les conversations/messages serveur.

À faire:

- Brancher listing conversations.
- Brancher création de conversation.
- Brancher listing paginé de messages.
- Brancher envoi de message avec `Idempotency-Key`.
- Brancher `markRead`.
- Brancher réactions et édition/suppression de message.
- Recevoir nouveaux événements via websocket.

Impact pages:

- `chat/page.tsx`
- `apps/components/platform/context-panel.tsx`

### Phase 3 - Teams + channels + annuaire workspace

Objectif:

- Sortir `teams/page.tsx` des mocks et rendre l'espace navigable par données réelles.

À faire:

- Brancher équipes.
- Brancher channels.
- Brancher membres workspace.
- Définir dans le client une stratégie de mapping entre team, channel et conversation.

Impact pages:

- `teams/page.tsx`
- `contacts/page.tsx` en première version "annuaire workspace"

### Phase 4 - Meetings, calendrier et expérience d'appel

Objectif:

- Utiliser le backend meeting existant pour le calendrier et l'entrée en appel.

À faire:

- Brancher listing et création de meetings.
- Brancher get/start/end/join-token.
- Faire converger `calendar/page.tsx` et le flux `/calls/room`.

Écart restant:

- L'historique d'appels de `calls/page.tsx` demandera probablement de nouveaux endpoints backend.

### Phase 5 - Réglages profil

Objectif:

- Rendre l'écran réglages utile sans attendre un backend complet de préférences.

À faire:

- Charger `GET /api/v1/me`.
- Sauver `PATCH /api/v1/me`.
- Limiter le scope initial à nom affiché, avatar, statut.

### Phase 6 - Applications et observabilité workspace

Objectif:

- Exposer la gestion d'intégrations et l'audit côté platform.

À faire:

- Brancher applications.
- Brancher audit logs.
- Créer ou adapter des pages UI dédiées si nécessaire.

Endpoints:

- `GET /api/v1/workspaces/:workspaceId/applications`
- `POST /api/v1/workspaces/:workspaceId/applications`
- `GET /api/v1/applications/:applicationId`
- `PATCH /api/v1/applications/:applicationId`
- `DELETE /api/v1/applications/:applicationId`
- `GET /api/v1/workspaces/:workspaceId/audit-logs`

## Gaps backend non couverts par `routes.go`

Les pages ci-dessous ne peuvent pas être réellement branchées sans nouvelles routes serveur:

- `notifications/page.tsx`
- `documents/page.tsx`
- `drive/page.tsx`
- `projects/page.tsx`
- `resources/page.tsx`
- `tasks/page.tsx`
- `calls/page.tsx` pour tout ce qui relève de l'historique téléphonie
- `contacts/page.tsx` pour un vrai carnet de contacts et des groupes dédiés
- `setings/page.tsx` pour les préférences avancées

## Recommandation d'implémentation client

Créer un module platform centré sur le contrat de `routes.go`, par exemple:

- `apps/lib/api/platform/me.ts`
- `apps/lib/api/platform/workspaces.ts`
- `apps/lib/api/platform/teams.ts`
- `apps/lib/api/platform/channels.ts`
- `apps/lib/api/platform/conversations.ts`
- `apps/lib/api/platform/messages.ts`
- `apps/lib/api/platform/meetings.ts`
- `apps/lib/api/platform/applications.ts`
- `apps/lib/api/platform/audit.ts`
- `apps/lib/realtime/platform-realtime.ts`

Puis brancher les pages dans cet ordre:

1. `layout` / shell
2. `chat`
3. `teams`
4. `calendar`
5. `setings`
6. surfaces secondaires

## Résumé exécutable

Le backend disponible dans `server/src/routes/routes.go` permet déjà de sortir des mocks sur cinq blocs utiles au client:

- identité utilisateur
- workspace et membres
- teams et channels
- conversations et messages
- meetings et intégrations

La roadmap client doit donc commencer par ces blocs. Les autres pages du platform restent aujourd'hui des démonstrateurs UI et nécessiteront de nouveaux endpoints serveur avant intégration réelle.
