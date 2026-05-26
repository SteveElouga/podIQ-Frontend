# PodIQ — Frontend

Interface Angular du produit **PodIQ** : Kubernetes pod intelligence avec moteur de mémoire.  
Stack : **Angular 21** · **PrimeNG 21** · **GraphQL over HTTP** · **SCSS / Design System Cobalt**.

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Structure du projet](#structure-du-projet)
6. [Architecture clé](#architecture-clé)
7. [Commandes de développement](#commandes-de-développement)
8. [Build & déploiement](#build--déploiement)
9. [Tests](#tests)
10. [Contribuer](#contribuer)

---

## Vue d'ensemble

PodIQ surveille vos pods Kubernetes, mémorise chaque incident et vous alerte avant que les mêmes problèmes ne se reproduisent. Ce dépôt est le **frontend** : une SPA Angular lazy-loadée, entièrement standalone, qui communique avec le backend via une API **GraphQL** unique (`POST /graphql`).

### Écrans principaux

| Route | Description |
|---|---|
| `/` | Landing marketing (visiteurs non authentifiés) |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription + choix de plan |
| `/onboarding` | Wizard 5 étapes (workspace → cluster → alertes) |
| `/dashboard` | Vue d'ensemble des incidents en cours |
| `/incidents/analyze` | Analyse IA d'un incident |
| `/incidents/history` | Historique des incidents |
| `/manifests/scan` | Scanner pré-déploiement |
| `/settings/api-keys` | Gestion des API keys |

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 22 LTS |
| npm | 10 |
| Angular CLI | 21 (`npm i -g @angular/cli`) |
| Backend PodIQ | démarré sur `http://localhost:8080` |

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-org/podiq-frontend.git
cd podiq-frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
ng serve
# → http://localhost:4200
```

---

## Configuration

### Variables d'environnement

Les fichiers d'environnement sont dans [`src/environments/`](src/environments/).

```typescript
// src/environments/environment.ts  (développement)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',   // URL du backend GraphQL
};
```

Pour la production, Angular substitue automatiquement `environment.production.ts` lors du build.

> **Note :** toutes les requêtes passent par `POST ${apiUrl}/graphql`. Il n'y a pas d'endpoints REST séparés.

---

## Structure du projet

```
src/
├── app/
│   ├── core/                        # Singletons (injectés globalement)
│   │   ├── graphql/
│   │   │   ├── auth.operations.ts      # Queries & mutations auth (register, login, workspaces…)
│   │   │   └── workspace.operations.ts # Queries & mutations workspace (cluster, invitations, alertes…)
│   │   ├── guards/
│   │   │   └── auth.guard.ts        # authGuard + guestGuard
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts  # Injecte le JWT dans chaque requête
│   │   │   └── error.interceptor.ts # Gère les erreurs HTTP + UNAUTHENTICATED GraphQL
│   │   ├── models/
│   │   │   └── auth.model.ts        # Interfaces : CurrentUser, Workspace, ClusterStatus…
│   │   └── services/
│   │       ├── auth.service.ts      # JWT store, login, register, selectWorkspace
│   │       ├── graphql.service.ts   # Client GraphQL avec cache TTL
│   │       ├── lang.service.ts      # Détection et changement de langue
│   │       ├── toast.service.ts     # Notifications PrimeNG toast
│   │       └── workspace.service.ts # CRUD workspace, tokens, alertes, invitations
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/               # Page de connexion
│   │   │   ├── register/            # Page d'inscription + sélection de plan
│   │   │   └── onboarding/          # Wizard 5 étapes post-register
│   │   ├── dashboard/               # Dashboard incident
│   │   ├── incidents/
│   │   │   ├── graphql/
│   │   │   │   └── incident.operations.ts  # Queries & mutations incidents
│   │   │   ├── analyze/             # Analyse IA
│   │   │   └── history/             # Historique
│   │   ├── manifests/
│   │   │   ├── graphql/
│   │   │   │   └── manifest.operations.ts  # Mutations scan manifest
│   │   │   └── scan/                # Scanner pré-déploiement
│   │   ├── marketing/landing/       # Landing page
│   │   └── settings/
│   │       ├── graphql/
│   │       │   └── api-key.operations.ts   # Queries & mutations API keys
│   │       └── api-keys/            # Clés API
│   ├── shared/
│   │   ├── components/layout/       # Shell : topbar + sidebar
│   │   └── design-system/           # Composants DS Cobalt (DsButton, DsIcon, DsTag…)
│   ├── app.component.ts
│   ├── app.config.ts                # Providers globaux (HTTP, i18n, PrimeNG)
│   └── app.routes.ts                # Routes lazy-loadées avec guards
├── assets/
│   ├── i18n/
│   │   ├── en.json                  # Traductions anglaises
│   │   └── fr.json                  # Traductions françaises
│   └── icons/                       # SVG icons
├── environments/
│   ├── environment.ts               # Dev
│   └── environment.production.ts    # Prod
└── styles/
    ├── _tokens.scss                 # Variables CSS Cobalt
    ├── _reset.scss
    └── global.scss
```

---

## Architecture clé

### Flux d'authentification

Le backend utilise un **double JWT** :

```
1. register() / login()
       │
       ▼
   user-JWT  ──────────────────────────────────────────────────────────┐
   (userId, email)                                                     │
       │                                                               │
       ▼                                                               │
2. listWorkspaces()                                                    │
       │                                                               │
       ├─ 0 workspace → /onboarding                                    │
       │                                                               │
       └─ ≥1 workspace → selectWorkspace(id)                          │
                               │                                       │
                               ▼                                       │
                        workspace-JWT  ◄──────────────────────────────┘
                        (workspace_id, role)
                               │
                               ▼
                          /dashboard
```

**`AuthService`** est le seul détenteur du token JWT. Il expose des signaux calculés :

```typescript
readonly isAuthenticated = computed(() => !!this._token());
readonly workspaceId     = computed(() => payload?.['workspace_id'] ?? null);
readonly role            = computed(() => payload?.['role'] ?? null);
readonly hasWorkspace    = computed(() => !!this.workspaceId());
```

L'`authInterceptor` injecte automatiquement le token courant dans chaque requête HTTP.

L'`errorInterceptor` intercepte deux types d'erreurs d'authentification :
- **Erreurs GraphQL** `UNAUTHENTICATED` (HTTP 200, `errors[].extensions.code === 'UNAUTHENTICATED'`)
- **Erreurs HTTP `401`**

Dans les deux cas, il déclenche un **refresh + retry** : `refreshToken()` (mutation GraphQL via cookie httpOnly), puis re-exécute la requête originale. Si le refresh échoue à son tour, il appelle `auth.logout()`.

Une garde `isRefreshRequest()` empêche la boucle infinie : la requête de refresh elle-même ne déclenche pas de nouveau refresh.

### Guards

| Guard | Comportement |
|---|---|
| `authGuard` | Bloque si non authentifié → `/auth/login` |
| `guestGuard` | Bloque si authentifié → `/dashboard` |
| `/onboarding` | Protégé par `authGuard` seul (accessible avec le user-JWT, avant création du workspace) |

### Opérations GraphQL — fichiers dédiés

Chaque module dispose d'un fichier `graphql/*.operations.ts` qui centralise **toutes** les queries, mutations et subscriptions du module. Les services importent depuis ces fichiers — ils ne déclarent plus d'opérations en ligne.

| Fichier | Contenu |
|---|---|
| `core/graphql/auth.operations.ts` | register, login, selectWorkspace, refreshToken, listWorkspaces |
| `core/graphql/workspace.operations.ts` | createWorkspace, updateWorkspace, generateInstallToken, inviteMember, createAlertRule, connectChannel, setQuietHours, clusterStatus… |
| `incidents/graphql/incident.operations.ts` | analyzeIncident, pollJob, analysisHistory |
| `manifests/graphql/manifest.operations.ts` | scanManifest |
| `settings/graphql/api-key.operations.ts` | createApiKey, revokeApiKey, listApiKeys |

### Services GraphQL

**`GraphqlService`** est un client HTTP minimal avec cache TTL en mémoire :

- `query<T>(gql, vars?, ttl?)` — GET logique, mis en cache 5 min par défaut
- `mutate<T>(gql, vars?)` — vide le cache à chaque appel
- `invalidate(substring?)` — invalide les entrées correspondantes

**`WorkspaceService`** contient toutes les mutations scoped au workspace :

| Méthode | Description |
|---|---|
| `createWorkspace(input)` | Crée le workspace (étape 1 onboarding) |
| `updateWorkspace(input)` | Met à jour (ex. `onboarded_at`) |
| `generateInstallToken(wsId)` | Token Helm pour l'agent (étape 3) |
| `clusterStatus(wsId)` | Statut instantané des clusters |
| `pollClusterStatus(wsId)` | Polling toutes les 5 s — Observable partagé |
| `inviteMember(input)` | Envoie une invitation par email (étape 4) |
| `generateInviteLink(wsId)` | Génère un lien d'invitation ouvert |
| `createAlertRule(input)` | Crée une règle d'alerte (étape 5) |
| `connectChannel(input)` | Connecte un canal de notification |
| `setQuietHours(input)` | Configure les heures silencieuses |

### Design System Cobalt

Composants disponibles via `@shared/design-system` :

| Composant | Description |
|---|---|
| `DsButtonComponent` | `variant`: primary / secondary / ghost · `size`: sm / md / lg |
| `DsIconComponent` | Icônes Lucide inline SVG — `name`, `size`, `stroke`, `color` |
| `DsTagComponent` | Chips sémantiques — `tone`: ok / warn / crit / info / accent / neutral |
| `DsDotComponent` | Indicateur statut avec pulse — `tone`, `size`, `pulse` |
| `DsSparklineComponent` | Mini-graphique pour métriques |
| `DsLangSwitcherComponent` | Sélecteur FR / EN |

### Internationalisation

- Fichiers : [`public/assets/i18n/en.json`](public/assets/i18n/en.json) et [`fr.json`](public/assets/i18n/fr.json)
- **Important** : Angular 17+ sert les assets depuis `public/`, pas `src/assets/`. Ne jamais éditer dans `src/assets/` (supprimé).
- Langue détectée depuis le navigateur, stockée en `localStorage`
- Pipe : `| translate` · Service : `TranslateService.instant()`
- Convention de clés : `feature.section.element`

---

## Commandes de développement

```bash
# Démarrer le serveur de dev (hot-reload)
ng serve

# Démarrer sur un port spécifique
ng serve --port 4201

# Vérifier les types TypeScript sans compiler
npx tsc --noEmit

# Linter
ng lint

# Générer un composant
ng generate component features/my-feature/components/my-component

# Générer un service
ng generate service core/services/my-service
```

---

## Build & déploiement

```bash
# Build développement
ng build

# Build production (AOT + tree-shaking + minification)
ng build --configuration production
# → dist/podiq-frontend/browser/

# Servir le build localement
npx http-server dist/podiq-frontend/browser -p 4200
```

### Routing SPA — configuration serveur

L'application utilise le HTML5 history API. Toutes les routes doivent pointer vers `index.html` :

```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Tests

Voir le guide complet : [`docs/TEST_GUIDE.md`](docs/TEST_GUIDE.md)

```bash
# Tests unitaires (watch mode)
ng test

# Tests unitaires (CI — une seule passe)
ng test --watch=false --browsers=ChromeHeadless

# Avec coverage
ng test --watch=false --browsers=ChromeHeadless --code-coverage
# → coverage/podiq-frontend/index.html
```

---

## Contribuer

1. Créer une branche depuis `main` : `git checkout -b feat/ma-feature`
2. Respecter les conventions de commit : `feat(scope): description` ([Conventional Commits](https://www.conventionalcommits.org/))
3. Vérifier avant de pousser :
   ```bash
   npx tsc --noEmit    # 0 erreur TypeScript
   ng lint             # 0 warning
   ng test --watch=false --browsers=ChromeHeadless
   ```
4. Ouvrir une MR en suivant [`docs/MR_TEMPLATE.md`](docs/MR_TEMPLATE.md)

### Standards

| Règle | Détail |
|---|---|
| TypeScript strict | Pas de `any`, interfaces pour tous les objets |
| Signals | `signal()` / `computed()` / `effect()` plutôt que Subject |
| OnPush | `ChangeDetectionStrategy.OnPush` sur tous les composants |
| Standalone | Pas de NgModule, imports directs dans chaque composant |
| SCSS | Pas de CSS inline, variables Cobalt via `var(--token)` |
| i18n | Tous les libellés via `| translate`, jamais de chaînes hardcodées |

---

> Pour la documentation du design system Cobalt (tokens, composants, maquettes),  
> consulter [`docs/PodIQ/`](docs/PodIQ/).

---

© 2026 PodIQ Labs — Propriétaire. Tous droits réservés.

