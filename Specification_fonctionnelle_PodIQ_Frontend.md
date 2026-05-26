# PodIQ — Spécification Fonctionnelle

**Version** : 1.1
**Date** : 2026-05-26
**Public cible** : Équipe backend (Django / DRF)
**Source** : `PodIQ Hi-fi.html` — 9 sections, ~30 écrans

> **Note v1.1** : Mise à jour des conventions transverses (REST → GraphQL, format erreurs, double JWT, refresh token) et des sections onboarding (route unique, validation, fallback demo token, machine à états du stepper).

---

## Index des écrans

| # | Section | Écran | Route suggérée |
|---|---------|-------|----------------|
| 01 | Acquisition | Landing marketing | `/` |
| 02 | Acquisition | Login | `/login` |
| 03 | Acquisition | Signup (3 variantes) | `/signup` |
| 04–09 | Acquisition | Onboarding (5 steps + complete) | `/onboarding` (SPA, navigation côté client) |
| 10 | Cluster intelligence | Cluster dashboard | `/dashboard` |
| 11 | Cluster intelligence | Incident analysis | `/incidents/:id` |
| 12 | Differentiators | Memory engine | `/memory` |
| 13 | Differentiators | Cross-service correlation | `/correlation` |
| 14 | Pre-deploy + CI/CD | Pre-deploy scan | `/predeploy` |
| 15 | Pre-deploy + CI/CD | CI/CD integration | `/cicd` |
| 16 | Drill-downs | Incident inbox | `/incidents` |
| 17 | Drill-downs | Pod detail | `/pods/:name` |
| 18 | Drill-downs | Service detail | `/services/:name` |
| 19 | Drill-downs | Cluster detail | `/clusters/:name` |
| 20 | States | Empty · Day 0 | `/dashboard` (vide) |
| 21 | States | Cluster disconnected | `/dashboard` (erreur) |
| 22 | States | Notifications inbox | `/notifications` |
| 23 | States | Command palette ⌘K | overlay global |
| 24 | Settings | Settings · Notifications | `/settings/notifications` |
| 25 | Settings | Settings · Overview | `/settings` |
| 26 | Settings sub-pages | Workspace & team | `/settings/team` |
| 27 | Settings sub-pages | Memory tuning | `/settings/memory` |
| 28 | Settings sub-pages | Billing | `/settings/billing` |
| 29 | Settings sub-pages | SSO & security | `/settings/security` |
| 30 | Settings sub-pages | Create API key (modal) | overlay |
| 31 | Edges | PR preview | `/incidents/:id/pr-preview` |
| 32 | Edges | Pod activity · 24h | `/pods/:name/activity` |
| 33 | Edges | Postmortem | `/incidents/:id/postmortem` |
| 34 | Edges | Help & docs | `/help` |
| 35 | Edges | Mobile alerts (iOS) | app iOS — hors web scope |
| 36 | Edges | Privacy + cookie banner | overlay global |

---

## Conventions transverses

### Transport API — GraphQL over HTTP

> ⚠️ **Toute la communication frontend ↔ backend passe par un seul endpoint `POST /graphql`.**  
> Il n'y a pas d'API REST séparée. Les sections ci-dessous décrivent les opérations sous forme de mutations/queries GraphQL ; les noms d'endpoint REST précédemment indiqués (`PATCH /api/…`, `POST /api/…`) sont obsolètes.

Chaque requête est un `POST /graphql` avec le body :
```json
{ "query": "mutation | query ...", "variables": { ... } }
```
La réponse est **toujours HTTP 200** (même en cas d'erreur d'authentification).

### Authentification — double JWT

Le backend émet deux types de JWT :

| Type | Payload | Obtenu via |
|------|---------|------------|
| **User-JWT** | `sub`, `email` | `register` / `login` mutation |
| **Workspace-JWT** | `workspace_id`, `role`, `sub` | `selectWorkspace(id)` mutation |

**Flux** :
```
login / register
    │
    ▼
user-JWT  ──────────────────────────────┐
    │                                   │
    ▼                                   │
listWorkspaces                          │
    │                                   │
    ├─ 0 workspace → /onboarding        │
    │                                   │
    └─ ≥1 workspace → selectWorkspace   │
                          │             │
                          ▼             │
                  workspace-JWT ◄───────┘
                  (workspace_id, role)
                          │
                          ▼
                      /dashboard
```

Toutes les mutations scoped à un workspace (`createAlertRule`, `inviteMember`, etc.) requièrent un **workspace-JWT**.  
L'header `Authorization: Bearer <jwt>` est injecté par `authInterceptor` sur chaque requête.

### Refresh token

- Cookie httpOnly `refresh_token` émis à la connexion.
- **Mutation** : `mutation { refreshToken }` → retourne un nouveau JWT.
- Le `refresh_token` est valide 30 jours (`remember=true`) ou 24h.
- **`errorInterceptor`** déclenche automatiquement le refresh dans deux cas :
  1. Réponse GraphQL avec `errors[].extensions.code === 'UNAUTHENTICATED'`
  2. Réponse HTTP `401`
  - Après refresh réussi : la requête originale est ré-exécutée (retry).
  - Si le refresh échoue : `logout()` + redirection `/auth/login`.
  - **Garde anti-boucle** : la requête `refreshToken` elle-même ne déclenche pas de retry.

> **Pendant l'onboarding** : le refresh ne s'applique pas à la création du workspace (step 1).  
> Si `selectWorkspace()` échoue (backend indisponible), l'UI continue en mode dégradé (voir step 3 — fallback demo token).

### Format de réponse GraphQL

Succès :
```json
{ "data": { "operationName": { ... } } }
```

Erreur :
```json
{
  "data": null,
  "errors": [
    {
      "message": "Workspace name must be lowercase.",
      "extensions": {
        "code": "VALIDATION_FAILED",
        "fields": { "name": "must be lowercase" }
      }
    }
  ]
}
```

### Codes d'erreur normalisés (`extensions.code`)

| `extensions.code` | Sens |
|-------------------|------|
| `VALIDATION_FAILED` | Payload invalide |
| `UNAUTHENTICATED` | JWT absent, expiré ou insuffisant |
| `FORBIDDEN` | Rôle insuffisant |
| `NOT_FOUND` | Ressource absente |
| `CONFLICT` | Ressource existe déjà (slug pris, etc.) |
| `BUSINESS_RULE_VIOLATION` | Règle métier (RMxxx) bloquée |
| `RATE_LIMITED` | Throttling |
| `CLUSTER_DISCONNECTED` | Agent K8s injoignable |

### Pagination
- Cursor-based par défaut sur les listes longues (incidents, events).
- Argument GraphQL : `(cursor: String, limit: Int = 50)`.

### Rôles & permissions
| Rôle | Lecture | Écriture | Admin (billing/SSO/API keys) |
|------|---------|----------|-------------------------------|
| `viewer` | ✅ | ❌ | ❌ |
| `member` | ✅ | ✅ (incidents, fixes, PR) | ❌ |
| `admin` | ✅ | ✅ | ✅ |

### Modèle de données (vue d'ensemble)
```
Workspace
  ├── Plan (free | pro | enterprise)
  ├── Region (eu | us | ap)
  ├── Members (User × Role)
  ├── Clusters
  │     ├── Nodes
  │     ├── Namespaces
  │     ├── Services
  │     └── Pods (events, metrics)
  ├── Incidents
  │     ├── RootCause
  │     ├── MemoryMatches
  │     └── ProposedFix → PullRequest
  ├── MemoryPatterns
  ├── AlertRules + Channels
  ├── APIKeys
  └── AuditLog
```

---

# 01 · Landing marketing

## 1. Vue d'ensemble
- **Route** : `/`
- **Rôle fonctionnel** : Présenter PodIQ aux visiteurs et orienter vers Login / Signup / Demo.
- **Acteurs** : Visiteur anonyme. Pas d'auth. SEO-friendly (SSR conseillé).

## 2. Composants et données affichées

| Composant | Type | Source | Règles |
|-----------|------|--------|--------|
| Nav top (Product, Use cases, Pricing, Docs, Changelog) | Liens statiques | Front | Sticky + blur backdrop au scroll |
| Hero — H1 "Your cluster doesn't have to crash twice." | Texte | Front (CMS-able) | — |
| Tag "New · Memory engine" | Tag + lien | Front | Cliquable → `/memory` |
| CTA primaire "Connect a cluster" | Bouton | Front | → `/signup` |
| CTA secondaire "Watch 90s demo" | Bouton | Front | → modal vidéo ou `/demo` |
| Hero visual — fake terminal | Statique | Front | Maquette UI — pas de live data |
| Logo strip (Meridian, Northwind, etc.) | Logos clients | Front (CMS-able) | — |
| Three-up features (Memory / Correlation / Pre-deploy) | Cards | Front | Liens vers `/memory`, `/correlation`, `/predeploy` |
| Big CTA dark "Stop debugging the same outage twice" | Bouton | Front | → `/signup` + `/demo` |
| Footer (Privacy, Terms, Security, Status) | Liens | Front | — |

## 3. Actions utilisateur

| Action | Comportement | API |
|--------|--------------|-----|
| Clic "Sign in" | Navigue `/login` | — |
| Clic "Get started" / "Connect a cluster" | Navigue `/signup` | — |
| Clic "Watch 90s demo" | Ouvre modal vidéo | — |
| Clic "Book a demo" | → `/demo` ou Calendly | — |
| Clic logo strip | Navigation vers case studies (futur) | — |

## 4. États
- **Initial** : statique, aucun chargement.
- **Erreur** : N/A (purement statique).

## 5. Règles métier
- **RM001** — Si visiteur déjà authentifié (cookie `refresh_token` valide) → afficher CTA "Open dashboard" au lieu de "Sign in" / "Get started".

## 6. Critères d'acceptation
```gherkin
Given je suis un visiteur anonyme
When je clique sur "Get started"
Then je suis redirigé vers /signup

Given je suis authentifié
When je visite /
Then le bouton "Get started" devient "Open dashboard"
And il pointe vers /dashboard
```

---

# 02 · Login

## 1. Vue d'ensemble
- **Route** : `/login`
- **Rôle** : Authentifier un utilisateur existant via SSO ou email/password.
- **Acteurs** : Utilisateur enregistré.

## 2. Composants et données affichées
Layout : 2 colonnes (form gauche / value prop droite).

| Composant | Type | Source | Règles |
|-----------|------|--------|--------|
| SSO buttons (Google, GitHub, SAML SSO) | Buttons | Front | OAuth redirect |
| Email field | Input | Saisie | Format email valide |
| Password field | Input password | Saisie | Min 8 chars |
| "Remember this device" | Checkbox | Saisie | Bool |
| "Forgot password?" link | Lien | — | → `/forgot-password` |
| Bouton "Sign in" | Submit | — | Active si email + password renseignés |
| Carte live "auth-api recovered" (visuel droite) | Statique | Front | Décor uniquement |
| SAML/OIDC hint box | Statique | Front | — |

## 3. Actions

### Sign in (email/password)
- **Déclencheur** : submit form
- **API** : `POST /api/auth/login`
- **Payload** :
```json
{ "email": "luc@acme.io", "password": "...", "remember": true }
```
- **Réponse 200** :
```json
{
  "data": {
    "user": { "id": "u_...", "email": "...", "role": "admin" },
    "workspace": { "id": "w_...", "slug": "acme-platform" },
    "access_token": "<jwt>",
    "expires_in": 3600
  }
}
```
Set cookie `refresh_token` httpOnly.
- **Validation** :
  - email : format RFC 5322
  - password : non vide
- **Erreurs** :
  - 401 `INVALID_CREDENTIALS`
  - 403 `EMAIL_NOT_VERIFIED` → afficher banner
  - 403 `SSO_REQUIRED` (workspace force SSO)
  - 429 `RATE_LIMITED` (5 tentatives / 10 min)

### SSO
- **Google** : `GET /api/auth/oauth/google/init` → redirect 302.
- **GitHub** : `GET /api/auth/oauth/github/init` → redirect.
- **SAML** : `POST /api/auth/saml/init` avec domaine email → redirect IdP.
- Callback : `/api/auth/oauth/<provider>/callback?code=...`

## 4. États
- **Initial** : form vide.
- **Loading** : spinner sur "Sign in" pendant l'appel.
- **Erreur credentials** : message rouge sous le password.
- **Erreur email non vérifié** : lien "Resend verification".
- **Erreur SSO forcé** : message + bouton "Continue with SSO".

## 5. Règles métier
- **RM010** — Après 5 échecs en 10 min → 429 + captcha optionnel.
- **RM011** — Si workspace `force_sso = true` → bloquer email/password pour les membres internes.
- **RM012** — `remember = true` → refresh token 30 jours, sinon 24h.

## 6. Critères d'acceptation
```gherkin
Given un utilisateur valide
When il soumet email + password corrects
Then il reçoit un JWT et un cookie refresh_token
And il est redirigé vers /dashboard

Given un workspace avec force_sso = true
When un membre tente email/password
Then 403 SSO_REQUIRED s'affiche
```

[AMBIGUÏTÉ] Le design affiche un compteur stats côté droit (MTTR, Pages, Memory) — données live workspace public ou décor ? **À CONFIRMER** : si live, prévoir endpoint public `GET /api/public/stats/:workspace_slug`.

---

# 03 · Signup (3 variantes)

3 designs proposés (`SignupSplit`, `SignupCentered`, `SignupPlanFirst`). Tous partagent la même logique backend ; le choix UI est cosmétique.

## 1. Vue d'ensemble
- **Route** : `/signup`
- **Rôle** : Créer un compte + workspace + sélectionner un plan.
- **Acteurs** : Visiteur anonyme.

## 2. Données saisies
| Champ | Type | Requis | Règles |
|-------|------|--------|--------|
| Email | string | ✅ | RFC 5322, domaine non blacklisté |
| Password | string | ✅ (si pas SSO) | Min 12 chars, 1 maj, 1 min, 1 chiffre |
| Plan | enum | ✅ | `free` \| `pro` \| `enterprise` |
| Billing cycle | enum | ✅ si `pro` | `monthly` \| `annual` |
| ToS accepted | bool | ✅ | Doit être `true` |

## 3. Actions

### Signup email/password
- **API** : `POST /api/auth/signup`
- **Payload** :
```json
{
  "email": "luc@acme.io",
  "password": "...",
  "plan": "pro",
  "billing_cycle": "monthly",
  "tos_accepted": true
}
```
- **Réponse 201** : crée `User`, déclenche email de vérification, retourne JWT temporaire (scope = `onboarding`).
- **Side effects** :
  1. Création `User` avec `email_verified = false`
  2. Envoi email vérification
  3. Création stub `Workspace` (sera finalisé à l'étape 1 de l'onboarding)
  4. Réservation trial 14j si `plan = pro`

### Signup SSO
- Même flow que Login SSO, mais avec `?intent=signup`. À la première connexion, marquer `is_new_user = true` pour rediriger vers `/onboarding/workspace`.

## 4. Validation password (live)
Indicateur 4-barres :
- 1 barre : 8+ chars
- 2 barres : + 1 chiffre
- 3 barres : + 1 majuscule
- 4 barres : + 1 caractère spécial

Renvoyer côté front sans appel API ; backend revalide à submit.

## 5. États
- **Initial**, **Loading**, **Erreur email pris** (`409 EMAIL_TAKEN`), **Erreur ToS** (`422`), **Erreur plan invalide** (`400`).

## 6. Règles métier
- **RM020** — Email doit être unique (insensitive case) — sinon 409.
- **RM021** — `plan = enterprise` → ne crée pas de subscription Stripe, marque `requires_sales_contact = true`, route → `/sales/contact`.
- **RM022** — Trial 14j s'applique uniquement à `pro` au premier signup workspace.
- **RM023** — Domaines email jetables (mailinator, etc.) bloqués.

## 7. Critères d'acceptation
```gherkin
Given un email non utilisé
When je soumets signup avec plan=pro, billing_cycle=monthly
Then un User est créé avec email_verified=false
And un trial 14j Pro est attaché au futur workspace
And je reçois un JWT scope=onboarding
And je suis redirigé vers /onboarding/workspace
```

---

# 04 · Onboarding — Step 1 : Workspace

## 1. Vue d'ensemble
- **Route** : `/onboarding` (étape 1 parmi 5 — route unique, navigation côté client)
- **Rôle** : Créer le workspace (nom, slug, icon, accent color, taille équipe, région).
- **Précondition** : user-JWT valide (utilisateur sans workspace ou premier workspace).

## 2. Composants et données saisies

| Champ | Type | Requis | Règles | Source |
|-------|------|--------|--------|--------|
| Workspace name | string | ✅ | **Min 2 chars** (validation front) | Saisie |
| URL slug | string | auto | Dérivé du nom : lowercase, tirets, alphanumérique | Calculé |
| Workspace icon | — | — | Première lettre du nom (avatar généré, pas d'upload v1) | Calculé |
| Accent color | hex | ✅ | Parmi 6 presets | Saisie |
| Team size | enum | ✅ | `solo` \| `2_10` \| `11_50` \| `50_plus` | Saisie |
| Region | enum | ✅ | `eu` \| `us` \| `ap` | Saisie |

## 3. Actions

### Submit (mutation GraphQL)
```graphql
mutation CreateWorkspace($input: CreateWorkspaceInput!) {
  createWorkspace(input: $input) {
    id
    name
    slug
  }
}
```
Variables :
```json
{
  "name": "Acme Platform",
  "region": "eu",
  "teamSize": "2_10",
  "accentColor": "#d97706"
}
```

Immédiatement après `createWorkspace` → `selectWorkspace(workspaceId)` pour échanger le user-JWT contre un workspace-JWT :
```graphql
mutation SelectWorkspace($id: String!) {
  selectWorkspace(id: $id) { token }
}
```

### Mode dégradé (backend indisponible)
Si `createWorkspace` échoue → l'UI continue avec un ID local (`local_<timestamp>`).  
Si `selectWorkspace` échoue → l'UI continue sans workspace-JWT (impacts : step 3 utilise un token démo, step 4/5 enregistrent les données localement).

## 4. États
- **Loading submit** : bouton "Continue" disabled + spinner "Creating…".
- **Erreur validation** : message rouge sous le champ nom (< 2 chars).
- **Erreur API** : toast d'erreur, mode dégradé activé silencieusement.

## 5. Règles métier
- **RM030** — Slug unique global, immuable après création.
- **RM031** — Region permanente. Affiché en hint "Data residency is permanent."
- **RM032** — Team size = télémétrie produit uniquement.
- **RM033** — Accent color = UI uniquement.

## 6. Critères d'acceptation
```gherkin
Given un nom de workspace valide (≥ 2 chars)
When je clique Continue
Then createWorkspace est appelé
And selectWorkspace est appelé avec le nouvel ID
And je passe à l'étape 2 avec un workspace-JWT

Given un nom de workspace de 1 char
When je clique Continue
Then un message d'erreur s'affiche
And aucun appel API n'est déclenché
```

---

# 05 · Onboarding — Step 2 : Choose plan

## 1. Vue d'ensemble
- **Route** : `/onboarding` — step 2 (navigation côté client)
- **Rôle** : Choisir Free / Pro / Enterprise + cycle de facturation.
- **Précondition** : step 1 complété.

> **Note** : En v1, la sélection de plan est **locale uniquement** (pas d'appel backend à cette étape).  
> Le plan est transmis lors de la finalisation de l'onboarding (`updateWorkspace`).

## 2. Données affichées
| Composant | Source |
|-----------|--------|
| Toggle Monthly/Annual (−20%) | Front state (signal `billingCycle`) |
| 3 plan cards (Free / Pro / Enterprise) | Hard-codé en front (`plans[]`) |
| Trial banner 14j | Affiché si plan sélectionné = pro |
| CTA "Contact sales" | Enterprise uniquement → lien externe |

Prix :
| Plan | Monthly | Annual |
|------|---------|--------|
| Free | $0 | $0 |
| Pro | $49/mo | $39/mo |
| Enterprise | Custom | Custom |

## 3. Actions

### Submit plan (local)
- Enregistre `selectedPlan` et `billingCycle` dans le state du composant.
- Avance à l'étape 3.
- Aucun appel backend à cette étape.

### (Futur) Submit plan backend
```graphql
mutation SelectPlan($input: SelectPlanInput!) {
  selectPlan(input: $input) { planId billingCycle trialEndsAt }
}
```

## 4. États
- Sélection radio par card (Pro sélectionné par défaut).
- Loading sur submit (immédiat, pas d'API).

## 5. Règles métier
- **RM040** — Trial 14j sur Pro = 1 fois par workspace.
- **RM041** — Downgrade Pro → Free pendant le trial = trial perdu.
- **RM042** — Enterprise : pas de Stripe, marquer `pending_sales = true`.

## 6. Critères d'acceptation
```gherkin
Given je suis à l'étape 2
When je sélectionne Pro et clique Continue
Then je passe à l'étape 3
And selectedPlan = 'pro'
```

---

# 06 · Onboarding — Step 3 : Connect cluster

## 1. Vue d'ensemble
- **Route** : `/onboarding` — step 3 (navigation côté client)
- **Rôle** : Installer l'agent PodIQ et attendre le premier ping.
- **Précondition** : workspace-JWT disponible. Si absent → mode dégradé (voir ci-dessous).

## 2. Composants
| Composant | Type | Source |
|-----------|------|--------|
| Method picker (Helm / kubectl / Terraform) | 3 cards, radio | Front state |
| Snippet d'install avec token | `pre` | Token généré par mutation + front |
| Bouton Copy | Clipboard API | Front |
| Status "Waiting for first ping…" | Polling | GraphQL query |
| Status "Connected · <cluster-name>" | Polling | GraphQL query |
| Bannière d'avertissement (mode dégradé) | Conditionnel | Front |

## 3. Actions

### Récupérer le token d'installation (mutation GraphQL)
```graphql
mutation GenerateInstallToken($workspaceId: String!) {
  generateInstallToken(workspaceId: $workspaceId) {
    token
    expiresAt
  }
}
```
TTL : 24h. Régénérable.

### Mode dégradé — fallback token démo
Si le workspace-JWT est absent (backend indisponible au step 1) **ou** si `generateInstallToken` échoue (erreur réseau / 5xx) :
- Token remplacé par `wsk_demo_00000000000000000000000000000000`
- Bannière d'avertissement affichée (orange) : "Offline mode — use the demo token to test the UI."
- Polling désactivé (pas de vrai cluster à attendre)
- L'utilisateur peut copier le snippet et passer au step suivant

> Les erreurs `UNAUTHENTICATED` sont gérées automatiquement par `errorInterceptor` (refresh + retry). La branche dégradée ne s'active que pour les erreurs non-auth.

### Polling du statut cluster (query GraphQL, toutes les 5s)
```graphql
query ClusterStatus($workspaceId: String!) {
  clusterStatus(workspaceId: $workspaceId) {
    id
    name
    status   # "pending" | "connected" | "error"
  }
}
```
S'arrête automatiquement quand un cluster passe à `connected` ou quand le composant est détruit.

## 4. États
| État | Affichage |
|------|-----------|
| Chargement token | "Generating install token…" (inline loader) |
| Idle, token prêt | Snippet + badge orange pulsé "Waiting for first ping…" |
| Connected | Badge vert "Connected · \<cluster-name\>" + bouton Continue actif |
| Mode dégradé | Snippet démo + bannière orange + bouton Continue actif |
| Timeout (>10 min) | Tips de troubleshooting inline |

## 5. Règles métier
- **RM050** — L'agent K8s envoie un heartbeat avec le token → crée `Cluster` lié au workspace.
- **RM051** — Agent en `read-only` strict : pas d'`exec`, pas de `port-forward`.
- **RM052** — Une connexion = un cluster. Plusieurs clusters = relancer l'install dans un autre contexte kubectl.

## 6. Critères d'acceptation
```gherkin
Given un workspace-JWT valide
When j'arrive à l'étape 3
Then generateInstallToken est appelé
And le snippet Helm s'affiche avec le vrai token

Given un workspace-JWT absent (mode dégradé)
When j'arrive à l'étape 3
Then le token démo est affiché
And une bannière d'avertissement est visible
And le bouton Continue est actif (pas de blocage)

Given un agent installé avec le bon token
When l'agent envoie un heartbeat
Then le polling détecte la connexion sous 10s
And le badge passe à "Connected"
```

---

# 07 · Onboarding — Step 4 : Invite team

## 1. Vue d'ensemble
- **Route** : `/onboarding` — step 4 (navigation côté client)
- **Rôle** : Inviter des coéquipiers et configurer auto-invite par domaine.

## 2. Composants
| Composant | Source |
|-----------|--------|
| Email input + role select (Admin/Member/Viewer) + bouton Add | Saisie |
| Liste invites accumulées | State local |
| Status par invite : `sent` (✓ vert) / `draft` (⏱ gris) | Calculé après appel API |
| Toggle auto-invite by domain | API |
| Bouton "Copy invite link" | GraphQL + Clipboard |
| Bouton "Skip this step" | Navigation directe |

## 3. Actions

### Ajouter une invitation (mutation GraphQL)
```graphql
mutation InviteMember($input: InviteMemberInput!) {
  inviteMember(input: $input) {
    id
    email
    role
    status
  }
}
```
Variables : `{ workspaceId, email, role }`

**Mode dégradé** : si workspace-JWT absent → invite ajoutée localement en statut `draft`, sans appel API.  
**Erreur API** → invite ajoutée localement en `draft` (non bloquant).

### Copy invite link (mutation GraphQL)
```graphql
mutation GenerateInviteLink($workspaceId: String!) {
  generateInviteLink(workspaceId: $workspaceId) { token }
}
```
→ Construit `https://<origin>/join/<token>` et copie dans le presse-papier.  
**Fallback** si no workspace-JWT : `https://<origin>/join/<slug>`.

## 4. États
- Invite list vide → "No invites yet — add teammates above."
- Status `sent` : vert ✓ (invitation envoyée par backend)
- Status `draft` : gris ⏱ (mode dégradé ou erreur API)
- Loading "Add" : spinner inline sur le bouton.

## 5. Règles métier
- **RM060** — Email d'invitation expire au bout de 7j.
- **RM061** — Rôle assignable ≤ rôle de l'inviteur.
- **RM062** — Auto-invite : jamais `admin`.
- **RM063** — Free : 3 membres max · Pro : 50 · Enterprise : illimité.

## 6. Critères d'acceptation
```gherkin
Given un workspace-JWT valide et une email valide
When j'ajoute une invitation
Then inviteMember est appelé
And l'invite apparaît en statut "sent"

Given l'API inviteMember échoue
When j'ajoute une invitation
Then l'invite apparaît en statut "draft" (pas de blocage)

Given un workspace pro avec 49 membres
When j'invite un 50e
Then BUSINESS_RULE_VIOLATION (RM063) est retourné
```

---

# 08 · Onboarding — Step 5 : Wire up alerts

## 1. Vue d'ensemble
- **Route** : `/onboarding` — step 5 (navigation côté client)
- **Rôle** : Choisir règles de sévérité et canaux de notification.

## 2. Composants
| Composant | Source |
|-----------|--------|
| 4 toggles règles (CrashLoop, Memory >90%, Pre-deploy scan, Automated fix) | State local + mutations GraphQL |
| 6 channel cards (Slack, PagerDuty, Email, Webhook, Teams\*, Discord) | State local + mutations GraphQL |
| Toggle quiet hours (22h–7h) | State local + mutation GraphQL |
| Bouton "Finish setup" | Déclenche toutes les mutations en parallèle |
| Bouton "Skip for now" | Navigation directe sans appel API |

\* Teams : désactivé ("Coming soon") en v1.

## 3. Actions

### Activer une règle d'alerte (mutation GraphQL)
```graphql
mutation CreateAlertRule($input: CreateAlertRuleInput!) {
  createAlertRule(input: $input) { id }
}
```
Variables : `{ workspaceId, eventType, name }`

Correspondance règle → `eventType` :
| Règle UI | `eventType` |
|----------|------------|
| CrashLoopBackOff | `crashloop` |
| Memory saturation | `oom` |
| Pre-deploy scan | `predeploy_block` |
| Automated fix | `fix_found` |

### Quiet hours (mutation GraphQL)
```graphql
mutation SetQuietHours($input: QuietHoursInput!) {
  setQuietHours(input: $input) { id }
}
```
Variables : `{ workspaceId, enabled, startTime: "22:00", endTime: "07:00", timezone, weekdaysOnly: false }`

### Finish setup
- Appels en parallèle (`forkJoin`) : une `createAlertRule` par règle activée + `setQuietHours` si activé.
- Non bloquant : si certains appels échouent, l'onboarding avance quand même vers l'écran Complete.
- **Mode dégradé** : si workspace-JWT absent → avance directement sans appel API.

## 4. États
- Channel `disabled` (Teams "Coming soon") → bouton désactivé, tag "coming soon".
- Channel `connected` → tag vert "Connected" + bouton "Configure".
- Loading "Finish setup" : spinner + label "Saving…".

## 5. Règles métier
- **RM070** — Un bouton "Skip for now" permet de passer cette étape sans channel connecté.
- **RM071** — Quiet hours ne bloque PAS les alertes `crit` (P1).
- **RM072** — Channel Webhook : URL `https://` obligatoire.
- **RM073** — Dedupe par défaut : 5 min crit, 10 min warn.

## 6. Critères d'acceptation
```gherkin
Given 3 règles activées et quiet hours ON
When je clique "Finish setup"
Then 3 mutations createAlertRule sont appelées en parallèle
And setQuietHours est appelée
And je passe à l'écran Complete (même si certains appels échouent)

Given je clique "Skip for now"
Then aucun appel API n'est déclenché
And je passe à l'écran Complete
```

---

# 09 · Onboarding — Complete

## 1. Vue d'ensemble
- **Route** : `/onboarding` — step 6 / écran final (navigation côté client)
- **Rôle** : Confirmer la fin de l'onboarding, marquer le workspace comme onboardé.

## 2. Composants
- Grand cercle ✓ (checkmark).
- Tag "Setup complete" en topbar.
- 4 summary cards (Workspace, Cluster, Team, Alerts).
- Section "What to do next" (3 actions suggérées).
- CTA "Go to dashboard" (primaire) · CTA "Take the tour" (secondaire).

## 3. Actions

### Marquer workspace comme onboardé (mutation GraphQL)
```graphql
mutation UpdateWorkspace($input: UpdateWorkspaceInput!) {
  updateWorkspace(input: $input) { onboardedAt }
}
```
Appelé au clic "Go to dashboard". Si workspace-JWT absent → navigation directe sans appel.

### Navigation
- "Go to dashboard" → `updateWorkspace` puis `/dashboard`
- "Take the tour" → (futur) overlay tour sur le dashboard

## 4. États
- État unique de succès.
- Loading "Go to dashboard" : spinner + label "Saving…".

## 5. Règles métier
- **RM080** — `workspace.onboarded_at` est set ici (mutation `updateWorkspace`).
- **RM081** — Si l'utilisateur navigue directement vers `/onboarding` après avoir complété l'onboarding, le guard redirige vers `/dashboard`.

---

# 09b · Onboarding — Machine à états du stepper

> Section transverse à tous les steps onboarding. Décrit le comportement du stepper sidebar.

## Principe

L'onboarding est une **SPA à route unique** (`/onboarding`). La navigation entre les 5 steps est gérée côté client via deux signaux Angular :

| Signal | Rôle |
|--------|------|
| `maxStepCompleted` | Étape la plus haute **validée** (= bouton "Continue" cliqué). Démarre à 0. |
| `maxStepVisited` | Étape la plus haute **visitée** (= ouvert au moins une fois). Démarre à 1. |

## 4 états visuels

Pour chaque step `n`, l'état est calculé dans l'ordre de priorité suivant :

| Priorité | Condition | État | Rendu |
|----------|-----------|------|-------|
| 1 | `n === currentStep` | `current` | Dot plein accent (orange) · label bold · sous-label "in progress" (pulsé) ou "editing" |
| 2 | `n <= maxStepCompleted` | `done` | Dot plein vert + ✓ |
| 3 | `n <= maxStepVisited` | `in-progress` | Anneau accent (transparent) · label accent · sous-label "in progress" (statique) |
| 4 | sinon | `pending` | Anneau gris · label gris |

## Sous-label du step courant

- **"in progress"** (dot pulsé) : première visite — `currentStep > maxStepCompleted`
- **"editing"** (icône crayon) : retour sur un step déjà validé — `currentStep <= maxStepCompleted`

## Navigabilité

Un step est cliquable dans le sidebar si `n <= maxStepVisited && n !== currentStep`.  
Les steps `pending` (jamais visités) ne sont pas cliquables.

## Scénario type

> L'utilisateur valide steps 1 et 2, arrive au step 3 sans continuer, puis revient au step 1 via le sidebar.

| Signal | Valeur |
|--------|--------|
| `currentStep` | 1 |
| `maxStepCompleted` | 2 |
| `maxStepVisited` | 3 |

→ États : step 1 = `current` ("editing"), step 2 = `done` (✓), step 3 = `in-progress` (anneau accent), steps 4–5 = `pending`.  
→ Steps 2 et 3 sont cliquables. Steps 4–5 sont bloqués.

---

# 10 · Cluster dashboard

## 1. Vue d'ensemble
- **Route** : `/dashboard` (ou `/clusters/:slug`)
- **Rôle** : Vue principale santé cluster en temps réel.

## 2. Composants

| Composant | Donnée | Source |
|-----------|--------|--------|
| KPI MTTR | string (4m) | `GET /api/clusters/:id/metrics?range=24h` |
| KPI Pages | string (12) | idem |
| KPI Memory patterns | number | idem |
| KPI healthy pods | "298 / 312" | idem |
| Liste services (top N) | array | `GET /api/services?cluster=...&sort=health` |
| Active incidents | array | `GET /api/incidents?status=open` |
| Sparklines par service | timeseries | `GET /api/services/:id/timeseries` |
| Cluster switcher (sidebar) | list | `GET /api/clusters` |
| Recent deploys ribbon | array | `GET /api/deploys?recent=true` |

## 3. Actions
- Clic sur service row → `/services/:name`
- Clic sur incident → `/incidents/:id`
- Range picker (1h/24h/7d/30d) → refetch metrics
- Cluster switcher → switch context

## 4. États
- **Loading** : skeleton + shimmer.
- **Empty** : voir écran 20 (Day 0).
- **Disconnected** : voir écran 21.
- **Nominal** : KPIs + tableau.

## 5. Règles métier
- **RM100** — Tous les chiffres se rafraîchissent toutes les 30s (polling ou WS).
- **RM101** — Si `cluster.last_heartbeat > 2 min` → état `disconnected`.

## 6. Critères d'acceptation
```gherkin
Given un cluster connecté avec 312 pods
When 14 pods sont unhealthy
Then le KPI "Healthy pods" affiche "298 / 312"
```

---

# 11 · Incident analysis

## 1. Vue d'ensemble
- **Route** : `/incidents/:id`
- **Rôle** : Diagnostic complet d'un incident — root cause, blast radius, memory matches, fix proposé.

## 2. Composants

| Composant | Source |
|-----------|--------|
| Header (titre, pod, sévérité, time) | `GET /api/incidents/:id` |
| Tag CRASHLOOPBACKOFF, restarts count | idem |
| Root cause card + confidence % | `incident.root_cause` |
| Memory recall list (n prior matches) | `incident.memory_matches[]` |
| Blast radius graph | `incident.blast_radius` |
| Proposed fix (PR diff) | `incident.proposed_fix` |
| Action buttons : Apply fix, Open PR, Dismiss | — |
| Timeline events | `GET /api/incidents/:id/timeline` |

## 3. Actions

### Apply fix
- **API** : `POST /api/incidents/:id/apply-fix`
- Crée une PR GitHub (via integration) ou affiche le YAML à appliquer si pas d'intégration.

### Dismiss
- **API** : `POST /api/incidents/:id/dismiss`
- **Payload** : `{ "reason": "false_positive" | "duplicate" | "resolved_manually", "note": "..." }`

### Acknowledge
- **API** : `POST /api/incidents/:id/ack`

## 4. États
- `open`, `acknowledged`, `mitigating`, `resolved`, `dismissed`.

## 5. Règles métier
- **RM110** — Apply fix nécessite rôle `member` mini.
- **RM111** — Confidence < 50% → bouton Apply fix grisé + tooltip "Low confidence, review manually".
- **RM112** — Un incident résolu peut être ré-ouvert dans les 24h s'il reflambe.

---

# 12 · Memory engine

## 1. Vue d'ensemble
- **Route** : `/memory`
- **Rôle** : Liste tous les patterns appris et leur fréquence.

## 2. Composants
| Composant | Source |
|-----------|--------|
| Search + filtres (service, severity) | Front state |
| Table patterns | `GET /api/memory-patterns` |
| Colonnes : fingerprint, première vue, dernière vue, occurrences, services impactés | idem |
| Détail panel (clic ligne) | `GET /api/memory-patterns/:id` |

## 3. Actions
- Recherche full-text → query param `?q=`
- Filtre service → `?service=auth-api`
- Édition manuelle d'un pattern (admin) → `PATCH /api/memory-patterns/:id`
- Suppression pattern → `DELETE /api/memory-patterns/:id` (admin only)

## 4. Règles métier
- **RM120** — Patterns expirent au bout de 90j sans occurrence (plan Free) ou jamais (Pro+).
- **RM121** — Pattern privé au workspace, jamais partagé cross-workspace.

---

# 13 · Cross-service correlation

## 1. Vue d'ensemble
- **Route** : `/correlation` (ou intégré dans Incident)
- **Rôle** : Visualiser le blast radius — quels services dépendent du service en panne.

## 2. Composants
- Graphe SVG (nodes = services, edges = dépendances HTTP/gRPC).
- Edges colorés par statut (crit/warn/ok).
- Sidebar list services impactés avec %.

## 3. Données
- **API** : `GET /api/correlations?root_service=auth-api&window=15m`
- **Réponse** :
```json
{
  "data": {
    "root": { "id": "svc_authapi", "name": "auth-api", "status": "crit" },
    "edges": [
      { "from": "auth-api", "to": "payments", "error_rate_delta": 1.0, "label": "5xx 100%" },
      { "from": "auth-api", "to": "checkout", "error_rate_delta": 0.7, "label": "5xx 70%" }
    ]
  }
}
```

## 4. Règles métier
- **RM130** — Détection basée sur les traces (OTel) si disponibles, sinon sur les métriques HTTP.

---

# 14 · Pre-deploy scan

## 1. Vue d'ensemble
- **Route** : `/predeploy`
- **Rôle** : Scanner un manifeste K8s avant deploy et matcher avec memory patterns.

## 2. Composants
| Composant | Source |
|-----------|--------|
| Upload zone / paste YAML | Saisie |
| Diff vs version précédente | Calculé backend |
| Liste warnings/errors | `POST /api/predeploy/scan` |
| Score safety 0-100 | idem |

## 3. Actions

### Scan
- **API** : `POST /api/predeploy/scan`
- **Payload** :
```json
{ "manifest": "<yaml>", "target_cluster": "prod-eu-west-1", "service": "auth-api" }
```
- **Réponse** :
```json
{
  "data": {
    "score": 72,
    "findings": [
      { "severity": "crit", "rule": "missing_env", "field": "DATABASE_URL", "matches_pattern": "p_abc", "history": "Caused 3 prior outages" }
    ]
  }
}
```

## 4. Règles métier
- **RM140** — Score < 50 = bloquant (CI fail) si CI/CD integration activée en mode strict.
- **RM141** — Findings groupés par sévérité.

---

# 15 · CI/CD integration

## 1. Vue d'ensemble
- **Route** : `/cicd`
- **Rôle** : Gérer les API keys + webhooks pour intégrer PodIQ à GitHub Actions/GitLab CI/CircleCI.

## 2. Composants
- Liste API keys avec scope.
- Bouton "Create key" → modal écran 30.
- Boutons d'install GitHub Action, GitLab CI snippet.
- Webhook events list.

## 3. Actions
- CRUD API keys : `GET/POST/DELETE /api/keys`
- Liste webhooks : `GET /api/webhooks`

## 4. Règles métier
- **RM150** — API key visible 1 seule fois à la création (irrécupérable ensuite).
- **RM151** — Scopes : `read:incidents`, `write:predeploy`, `admin:workspace`.

---

# 16 · Incident inbox

## 1. Vue d'ensemble
- **Route** : `/incidents`
- **Rôle** : Liste paginée de tous les incidents avec filtres.

## 2. Composants
- Filtres : status, severity, service, cluster, range.
- Table incidents : title, severity, status, service, age, assignee.
- Bulk actions : ack, dismiss, assign.

## 3. Actions
- **API** : `GET /api/incidents?status=open&severity=crit&cursor=...`
- Bulk ack : `POST /api/incidents/bulk-ack` payload `{ ids: [...] }`

## 4. Règles métier
- **RM160** — Viewer ne voit pas les boutons d'action bulk.

---

# 17 · Pod detail

## 1. Vue d'ensemble
- **Route** : `/pods/:name`
- **Rôle** : Détail complet d'un pod : events, logs récents, métriques, restarts.

## 2. Composants
- Header pod (name, ns, node, image, age).
- Tabs : Overview / Events / Logs / Metrics / Memory matches.
- Quick actions : Restart pod (member+), Open shell (admin) [À CONFIRMER si exec autorisé — design dit read-only strict, contradiction].

## 3. APIs
- `GET /api/pods/:name`
- `GET /api/pods/:name/events`
- `GET /api/pods/:name/logs?tail=200`
- `GET /api/pods/:name/metrics?range=1h`

[AMBIGUÏTÉ] Le bouton "Restart pod" est-il dans le scope read-only ? **À CONFIRMER**.

---

# 18 · Service detail

## 1. Vue d'ensemble
- **Route** : `/services/:name`
- **Rôle** : Vue agrégée d'un service (n pods, SLOs, deploys récents, incidents).

## 2. Composants
- Header service + SLO badges.
- Sparklines (latency p50/p95/p99, error rate, RPS).
- Tableau pods.
- Liste deploys récents.
- Incidents history.

## 3. APIs
- `GET /api/services/:name`
- `GET /api/services/:name/pods`
- `GET /api/services/:name/timeseries?metric=latency_p99&range=24h`
- `GET /api/services/:name/deploys`

---

# 19 · Cluster detail

## 1. Vue d'ensemble
- **Route** : `/clusters/:name`
- **Rôle** : Vue de bas niveau d'un cluster — nodes, capacity, version K8s.

## 2. Composants
- Nodes table (cpu/mem/pods alloc).
- Namespaces.
- Agent status (version, last heartbeat).

## 3. APIs
- `GET /api/clusters/:name`
- `GET /api/clusters/:name/nodes`
- `GET /api/clusters/:name/namespaces`

---

# 20 · Empty state (Day 0 dashboard)

## 1. Vue d'ensemble
- **Route** : `/dashboard` quand aucun cluster connecté ou cluster vide.
- **Rôle** : Onboarder l'utilisateur sur un dashboard vide.

## 2. Composants
- Illustration "no data yet".
- CTA "Connect a cluster" → `/onboarding/cluster`.
- Sample data toggle (mode demo) → flag `?demo=true`.

## 3. Règles métier
- **RM200** — Si `workspace.clusters.count == 0` → toujours afficher cet état au lieu du dashboard nominal.

---

# 21 · Cluster disconnected (error state)

## 1. Vue d'ensemble
- **Rôle** : Avertir que l'agent a stoppé de phoner.

## 2. Composants
- Banner rouge "Cluster <name> hasn't pinged in 5m".
- Troubleshooting steps (kubectl get pods, restart agent).
- Last seen timestamp.

## 3. Règles métier
- **RM210** — `last_heartbeat > 2 min` → état warning.
- **RM211** — `> 10 min` → état critical + email admin.

---

# 22 · Notifications inbox

## 1. Vue d'ensemble
- **Route** : `/notifications`
- **Rôle** : Centre de notifications in-app.

## 2. Composants
- Liste notifications (incidents, mentions, system).
- Mark all as read.
- Filtres.

## 3. APIs
- `GET /api/notifications?unread=true`
- `POST /api/notifications/mark-read` payload `{ ids: [...] }`

---

# 23 · Command palette ⌘K

## 1. Vue d'ensemble
- Overlay global, déclenché par `⌘K` ou `Ctrl+K`.
- **Rôle** : Navigation + actions rapides.

## 2. Composants
- Input search.
- Liste résultats catégorisés : Pods, Services, Incidents, Actions, Settings.
- Keyboard nav (↑↓ Enter Esc).

## 3. APIs
- `GET /api/search?q=auth&types=pod,service,incident&limit=10`

## 4. Règles métier
- **RM230** — Résultats triés par fréquence d'accès personnelle, puis recency.

---

# 24-25 · Settings (Overview + Notifications)

## 1. Vue d'ensemble
- **Route** : `/settings`, `/settings/notifications`
- **Rôle** : Hub de configuration workspace.

## 2. Composants Overview
- Liste sections : Workspace & team, Notifications, Memory, Billing, Security, API keys.
- Aperçu par section.

## 3. Composants Notifications
- Channels list (réutilise onboarding step 5).
- Règles d'alerte (réutilise).
- Quiet hours.

---

# 26 · Workspace & team

## 1. Vue d'ensemble
- **Route** : `/settings/team`
- **Rôle** : Gérer membres + invitations + rôles.

## 2. Composants
- Table membres (avatar, name, email, role, last active).
- Bouton "Invite member" → modal.
- Section pending invites.
- Bulk actions (change role, remove).

## 3. APIs
- `GET /api/members`
- `PATCH /api/members/:id` `{ role: "admin" }`
- `DELETE /api/members/:id`
- `POST /api/invitations` (déjà couvert)

## 4. Règles métier
- **RM260** — Un workspace doit avoir ≥ 1 admin actif.
- **RM261** — On ne peut pas se retirer soi-même si on est le seul admin.

---

# 27 · Memory engine · tuning

## 1. Vue d'ensemble
- **Route** : `/settings/memory`
- **Rôle** : Tuner sensibilité du moteur de mémoire.

## 2. Composants
- Slider sensitivity (0–100).
- Slider min confidence to surface (0–100).
- Slider expiry days.
- Pattern blacklist input.

## 3. APIs
- `GET /api/workspaces/:id/memory-config`
- `PATCH /api/workspaces/:id/memory-config` payload `{ sensitivity: 70, min_confidence: 50, expiry_days: 90, blacklist: [...] }`

---

# 28 · Billing

## 1. Vue d'ensemble
- **Route** : `/settings/billing`
- **Rôle** : Plan actuel, payment method, factures, usage.

## 2. Composants
- Plan card (current plan, next bill date, amount).
- Bouton "Change plan".
- Payment method (Stripe Elements).
- Liste factures (`GET /api/invoices`).
- Usage meter (clusters / pods).

## 3. APIs
- `GET /api/billing/subscription`
- `POST /api/billing/portal` → URL Stripe Customer Portal.
- `GET /api/invoices` paginated.

## 4. Règles métier
- **RM280** — Admin uniquement.
- **RM281** — Cancel = downgrade au prochain cycle, pas immédiat.

---

# 29 · SSO & security

## 1. Vue d'ensemble
- **Route** : `/settings/security`
- **Rôle** : Configurer SSO SAML/OIDC, force SSO, sessions.

## 2. Composants
- SAML config (Entity ID, ACS URL, IdP metadata upload).
- Toggle "Force SSO for all members".
- Liste sessions actives (`GET /api/sessions`).
- Audit log link.
- 2FA enforcement toggle.

## 3. APIs
- `GET/POST /api/sso/saml`
- `PATCH /api/workspaces/:id/security` payload `{ force_sso, require_2fa, session_timeout_min }`

## 4. Règles métier
- **RM290** — Pro plan minimum pour SAML.
- **RM291** — Enterprise pour SCIM provisioning.

---

# 30 · Create API key (modal)

## 1. Vue d'ensemble
- Modal overlay sur `/settings/api-keys` ou `/cicd`.
- **Rôle** : Créer une nouvelle API key.

## 2. Composants
- Input name.
- Scopes (checkboxes).
- Expiration (date picker, max 1 an).
- Bouton Create.

## 3. APIs
- `POST /api/keys`
- **Payload** : `{ "name": "github-ci", "scopes": ["read:incidents", "write:predeploy"], "expires_at": "2027-05-18" }`
- **Réponse 201** : `{ "data": { "id": "ak_...", "name": "...", "token": "podiq_live_abc...", "scopes": [...] } }`
- **IMPORTANT** : `token` retourné une seule fois.

## 4. Règles métier
- **RM300** — Token jamais re-affiché. Hash stocké backend.
- **RM301** — Limite : 20 keys / workspace.

---

# 31 · PR preview (Apply fix)

## 1. Vue d'ensemble
- **Route** : `/incidents/:id/pr-preview`
- **Rôle** : Prévisualiser le diff avant de créer la PR GitHub.

## 2. Composants
- Diff viewer (before/after YAML).
- Commit message éditable.
- Repository + branch picker.
- Bouton "Open PR" / "Copy patch".

## 3. APIs
- `GET /api/incidents/:id/fix/preview`
- `POST /api/incidents/:id/fix/pr` payload `{ repo, branch, commit_message }`

---

# 32 · Pod activity · 24h

## 1. Vue d'ensemble
- **Route** : `/pods/:name/activity`
- **Rôle** : Heatmap / timeline détaillée des events sur 24h.

## 2. Composants
- Heatmap par heure × type d'event.
- Liste filtrée events.

## 3. APIs
- `GET /api/pods/:name/activity?range=24h&granularity=hour`

---

# 33 · Postmortem

## 1. Vue d'ensemble
- **Route** : `/incidents/:id/postmortem`
- **Rôle** : Document postmortem auto-généré à partir de la timeline + diagnostic.

## 2. Composants
- Markdown rendered.
- Sections : Summary, Timeline, Root cause, Resolution, Action items.
- Bouton "Export PDF", "Copy markdown".

## 3. APIs
- `GET /api/incidents/:id/postmortem`
- `POST /api/incidents/:id/postmortem/regenerate`

---

# 34 · Help & docs

## 1. Vue d'ensemble
- **Route** : `/help`
- **Rôle** : Centre d'aide in-app (docs, FAQs, contact support).

## 2. Composants
- Search docs.
- Liens vers articles.
- Bouton "Contact support" → ticket.

## 3. APIs
- `GET /api/help/search?q=...`
- `POST /api/help/tickets` payload `{ subject, body, attachments }`

---

# 35 · Mobile alerts (iOS) — [HORS SCOPE WEB]

Écran natif iOS. Spec mobile séparée. Le backend doit exposer :
- Push notifications via APNs.
- Endpoint device registration : `POST /api/devices` `{ platform: "ios", token: "..." }`.

---

# 36 · Privacy + cookie banner

## 1. Vue d'ensemble
- Overlay sur première visite anonyme.
- **Rôle** : Conformité RGPD / CCPA.

## 2. Composants
- Banner bottom.
- Boutons : Accept all, Reject non-essential, Customize.
- Modal préférences (cookie categories).

## 3. Données
- `POST /api/consent` payload `{ analytics: true, marketing: false, functional: true }` → cookie 1 an.

## 4. Règles métier
- **RM360** — Visiteurs EU : opt-in explicite obligatoire pour analytics/marketing.
- **RM361** — Cookie consent expire 12 mois.

---

## Annexe — Glossaire

| Terme | Définition |
|-------|------------|
| Workspace | Unité d'isolation tenant. 1 user peut appartenir à plusieurs. |
| Cluster | Cluster Kubernetes connecté via l'agent PodIQ. |
| Pod | Unité K8s, watched par l'agent. |
| Service | Regroupement logique de pods (typiquement un Deployment). |
| Memory pattern | Empreinte d'un incident passé, réutilisée pour diagnostics futurs. |
| Confidence | Score 0-100 de probabilité que la root cause proposée soit correcte. |
| Blast radius | Ensemble des services affectés par cascade. |
| Heartbeat | Ping périodique de l'agent au backend (toutes les 30s). |

---

## Annexe — Tags à clarifier

Recherche `[AMBIGUÏTÉ]` et `[À CONFIRMER]` dans ce document.

| Tag | Section | Question |
|-----|---------|----------|
| [AMBIGUÏTÉ] | 02 Login | Stats live workspace public ou décor ? |
| [AMBIGUÏTÉ] | 17 Pod detail | Restart pod compatible avec agent read-only ? |
| [À CONFIRMER] | 27 Memory tuning | Sensibilité globale workspace ou per-service ? |
| [À CONFIRMER] | 32 Pod activity | Granularité min = heure ou minute ? |

---

**Fin du document.**
