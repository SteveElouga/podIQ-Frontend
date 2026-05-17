# 🚀 Prompt Angular + PrimeNG Setup (Pour Claude Code dans Cursor)

## Option 1 : Nouveau projet de zéro

Copie-colle ce prompt dans Cursor avec l'extension Claude :

```
@claude 

Je veux créer un nouveau projet Angular avec PrimeNG. Voici ce que je besoin:

**Setup Initial:**
- Crée un nouveau projet Angular 18+ (ng new si nécessaire)
- Installe et configure PrimeNG (ng add primeng)
- Configure le module d'imports pour PrimeNG
- Setup de base avec un layout principal

**Structure de dossiers requise:**
```
src/
├── app/
│   ├── components/        # Composants métier
│   ├── layouts/           # Layouts principaux
│   ├── shared/            # Composants partagés
│   ├── services/          # Services
│   ├── models/            # Interfaces/Models
│   └── app.component.ts
├── assets/
└── styles/
    └── global.scss
```

**Configuration PrimeNG:**
- Active les composants primeng par défaut
- Configure le thème (ex: lara-light-blue)
- Import des icônes PrimeNG
- Setup du routing si applicable

**Prochaines étapes:**
- Crée un composant layout/navigation avec p-toolbar
- Crée un composant content/dashboard basique
- Export tous les imports PrimeNG nécessaires dans un module partagé

Affiche-moi la structure finale et on peut commencer à implémenter le design.
```

---

## Option 2 : Intégrer dans un projet existant

```
@claude

Je veux intégrer PrimeNG à mon projet Angular existant. Voici le contexte:

**Projet actuel:**
- Version Angular: [18/17/16 - spécifiez votre version]
- Structure actuelle: [brièvement - ex: par modules, par features]
- Dépendances principales: [listez-les]

**À faire:**
1. Ajoute PrimeNG proprement (ng add primeng)
2. Configure un module SharedModule pour exporter les composants PrimeNG
3. Crée une structure de layout si elle n'existe pas:
   - Header avec p-toolbar
   - Sidebar/Navigation
   - Main content area
4. Setup un service d'authentification basique (si applicable)
5. Configure le routing principal

**Je vais te montrer mon design ensuite** pour que tu crées les composants correspondants.

Dis-moi quand tu es prêt et montre-moi la structure mise à jour.
```

---

## Option 3 : Intégrer un design spécifique

```
@claude

Je veux implémenter ce design en Angular + PrimeNG:

[COLLEZ VOTRE DESIGN HTML/CODE ICI OU LA DESCRIPTION]

**Détails du design:**
- Type: [Dashboard/E-commerce/Admin/Blog/etc]
- Sections principales: [listez-les]
- Interactions requises: [formulaires, filtres, etc]

**Architecture Angular:**
- Crée des composants réutilisables pour chaque section
- Utilise PrimeNG pour tous les éléments UI
- Ajoute les services nécessaires (API calls, state management si besoin)
- Configure le routing approprié
- Style cohérent avec le design original

**Priorités:**
1. Structure de base et routing
2. Composants principaux
3. Styling et responsive design
4. Logique métier et services

Implémente étape par étape et montre-moi le résultat à chaque phase.
```

---

## Option 4 : Workflow complet (Design → Code)

```
@claude

Workflow complet: je vais te donner un design et tu vas l'implémenter entièrement.

**Étape 1 - Analyse:**
- Examine le design
- Identifie les composants PrimeNG à utiliser
- Propose une architecture Angular adaptée

**Étape 2 - Setup:**
- Crée/configure le projet Angular + PrimeNG
- Crée la structure de dossiers optimale

**Étape 3 - Implémentation:**
- Crée les composants principaux
- Intègre les composants PrimeNG
- Ajoute le styling
- Configure le routing

**Étape 4 - Polish:**
- Responsive design
- Animations (optionnel)
- Services d'exemple pour les appels API

Voici mon design:

[COLLEZ VOTRE DESIGN ICI]

Go!
```

---

## 💡 Tips pour utiliser ces prompts:

### Dans Cursor:
1. Ouvre l'extension Claude (raccourci: `Cmd+K` ou `Ctrl+K`)
2. Tape ou colle le prompt ci-dessus
3. Appuie sur Enter pour lancer

### Variables à personnaliser:
- `[version Angular]` → Ex: 18, 17, 16
- `[COLLEZ VOTRE DESIGN]` → Code HTML, description, ou screenshot
- `[listez-les]` → Adaptez à votre contexte

### Pour obtenir un meilleur résultat:
- **Soyez spécifiques** sur les sections du design
- **Mentionnez les composants PrimeNG** si vous en avez de préférés
- **Expliquez l'objectif** (dashboard, shop, admin, etc)
- **Spécifiez les interactions** (clics, soumissions, filtres)

---

## 📦 Composants PrimeNG courants pour designs:

```
Navigation & Layout:
- p-toolbar
- p-sidebar
- p-menu
- p-tabview

Data Display:
- p-table
- p-card
- p-panel
- p-accordion

Forms:
- p-input
- p-dropdown
- p-checkbox
- p-button
- p-form

Dashboard/Stats:
- p-card (pour les KPIs)
- p-chart
- p-progressbar

Dialogs & Feedback:
- p-dialog
- p-toast
- p-confirmDialog
- p-progressSpinner
```

---

## 🔗 Ressources utiles:

- **PrimeNG Docs**: https://primeng.org/
- **Angular Docs**: https://angular.io/docs
- **PrimeNG Components**: https://primeng.org/components

---

**Prêt(e) ? Copiez le prompt qui correspond à votre situation et lancez-le dans Cursor !**
