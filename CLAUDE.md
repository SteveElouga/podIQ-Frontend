# CLAUDE.md - Configuration Claude Code pour Angular + PrimeNG

Ce fichier guide Claude Code sur les standards, architectures et meilleures pratiques à suivre pour votre projet.

---

## 📋 Table des matières

1. [Documentations Anthropic (Claude Code & MCP)](#anthropic)
2. [Documentations Angular](#angular)
3. [Documentations PrimeNG](#primeng)
4. [Meilleures pratiques & Architecture](#best-practices)
5. [Instructions de configuration](#instructions)

---

## <a name="anthropic"></a>🤖 Documentations Anthropic (Claude Code & MCP)

### Claude Code
- **Vue d'ensemble Claude Code**: https://docs.claude.com/en/docs/claude-code/overview
- **Docs Map Claude Code**: https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md
- **Installation & Setup**: https://docs.anthropic.com/en/docs/claude-code/install
- **npm Package**: https://www.npmjs.com/package/@anthropic-ai/claude-code

### Claude API (pour comprendre les capacités)
- **Claude API Overview**: https://docs.claude.com/en/api/overview
- **Docs Map General**: https://docs.claude.com/en/docs_site_map.md
- **Function Calling/Tool Use**: https://docs.claude.com/en/docs/build-with-claude/tool-use
- **Batch Processing**: https://docs.claude.com/en/docs/guides/batch-processing

### MCP (Model Context Protocol)
- **MCP Documentation**: https://modelcontextprotocol.io/
- **MCP GitHub**: https://github.com/modelcontextprotocol/specification
- **MCP Tools & Servers**: https://modelcontextprotocol.io/compatible-hosts
- **Anthropic MCP Guide**: https://docs.anthropic.com/en/docs/build-with-claude/mcp

---

## <a name="angular"></a>🅰️ Documentations Angular

### Angular Official
- **Angular Docs**: https://angular.io/docs
- **Angular CLI**: https://angular.io/cli
- **Angular Architecture**: https://angular.io/guide/architecture
- **Routing**: https://angular.io/guide/router
- **Modules**: https://angular.io/guide/ngmodules
- **Components**: https://angular.io/guide/component-overview

### Angular Versioning
- **Angular 18 Guide**: https://angular.io/guide/what-is-angular
- **Breaking Changes**: https://angular.io/guide/update-to-latest-version
- **Angular Version Info**: https://angular.io/guide/releases

### State Management
- **RxJS (Observables)**: https://rxjs.dev/
- **NgRx (State Management)**: https://ngrx.io/
- **Services & Dependency Injection**: https://angular.io/guide/dependency-injection

### Performance & Best Practices
- **Performance Guide**: https://angular.io/guide/performance-best-practices
- **Security**: https://angular.io/guide/security
- **Change Detection**: https://angular.io/guide/change-detection
- **Lazy Loading**: https://angular.io/guide/lazy-loading-ngmodules

---

## <a name="primeng"></a>🎨 Documentations PrimeNG

### PrimeNG Official
- **PrimeNG Home**: https://primeng.org/
- **PrimeNG Components**: https://primeng.org/components
- **PrimeNG Installation**: https://primeng.org/installation-angular
- **PrimeNG Themes**: https://primeng.org/themes
- **PrimeNG Icons**: https://primeng.org/icons

### Components par catégorie
- **Forms**: https://primeng.org/formlayout
- **Data**: https://primeng.org/table
- **Panels**: https://primeng.org/panel
- **Overlay**: https://primeng.org/dialog
- **Messages**: https://primeng.org/toast
- **Menu**: https://primeng.org/menu
- **Buttons**: https://primeng.org/button
- **Input**: https://primeng.org/input

### Styling & Customization
- **CSS Variables**: https://primeng.org/theming
- **Tailwind CSS with PrimeNG**: https://primeng.org/tailwind
- **Bootstrap Integration**: https://primeng.org/bootstrap

---

## <a name="best-practices"></a>✨ Meilleures pratiques & Architecture

### Angular Best Practices
- **Angular Style Guide**: https://angular.io/guide/styleguide
- **Architecture Patterns**: https://angular.io/guide/architecture-best-practices
- **Smart & Presentational Components**: https://angular.io/guide/template-reference-variables
- **Folder Structure**: https://angular.io/guide/file-structure

### Clean Code & SOLID
- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **Clean Code Guide**: https://github.com/ryanmcdermott/clean-code-javascript
- **Design Patterns**: https://refactoring.guru/design-patterns

### Responsive Design
- **CSS Flexbox Guide**: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- **CSS Grid Guide**: https://css-tricks.com/snippets/css/complete-guide-grid/
- **Mobile First Approach**: https://www.w3schools.com/css/css_rwd_intro.asp

### Testing
- **Jasmine Testing**: https://jasmine.github.io/
- **Angular Testing**: https://angular.io/guide/testing
- **Unit Testing Best Practices**: https://angular.io/guide/testing-code-coverage

### Git & Version Control
- **Git Best Practices**: https://git-scm.com/docs
- **Conventional Commits**: https://www.conventionalcommits.org/

---

## <a name="instructions"></a>🛠️ Instructions de configuration pour Claude Code

### 1. Respecter l'architecture Angular
```
Chaque nouveau composant doit:
- Être dans src/app/components/ ou src/app/features/
- Avoir un dossier dédié avec .ts, .html, .scss
- Respecter la convention de nommage Angular
- Être déclaré dans un module approprié
```

### 2. Utiliser PrimeNG correctement
```
Priorités:
1. Utiliser les composants PrimeNG pour tout élément UI
2. Ne pas créer de custom components si PrimeNG a une solution
3. Respecter les classes CSS de PrimeNG
4. Utiliser les thèmes officiels, pas de custom styling si possible
5. Importer depuis 'primeng/*' et non depuis des chemins bruts
```

### 3. Structure de projet obligatoire
```
src/
├── app/
│   ├── core/                # Services singleton (http, auth, guards, interceptors)
│   │   ├── graphql/         # ⚡ Opérations GraphQL du core (1 fichier par domaine)
│   │   │   ├── auth.operations.ts
│   │   │   └── workspace.operations.ts
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── services/
│   ├── features/            # Modules métier (par domaine)
│   │   └── [feature]/
│   │       ├── graphql/     # ⚡ Opérations GraphQL du feature (1 fichier par module)
│   │       │   └── [feature].operations.ts
│   │       ├── components/
│   │       ├── models/
│   │       └── services/
│   ├── shared/              # Composants, pipes, directives partagés
│   │   ├── components/
│   │   ├── design-system/
│   │   └── modules/
│   ├── app.config.ts        # Providers globaux (standalone, pas de NgModule)
│   ├── app.routes.ts        # Routes lazy-loadées avec guards
│   └── app.component.ts
├── assets/
│   └── i18n/                # Traductions (en.json, fr.json)
├── styles/
│   ├── variables.scss
│   ├── global.scss
│   └── primeng-custom.scss
└── environments/            # Configuration par env
```

### 4. Module Partagé obligatoire
```typescript
// shared/modules/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
// ... ajouter tous les composants utilisés

const PRIMENG_MODULES = [
  ButtonModule,
  CardModule,
  TableModule,
  // ...
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIMENG_MODULES]
})
export class SharedModule { }
```

### 5. Services & Dépendances
```
Règles:
- Tous les services HTTP dans core/services/
- Services métier dans features/[feature]/services/
- Utiliser l'injection de dépendances systématiquement
- Utiliser RxJS Observables pour l'async
- Favoriser les signaux Angular 18+ quand possible
```

### 5b. Opérations GraphQL — fichiers dédiés
```
Règle absolue : ne jamais déclarer de query/mutation/subscription directement dans un service.
Créer un fichier core/graphql/[module].operations.ts ou features/[f]/graphql/[f].operations.ts
qui exporte toutes les opérations du module sous forme de constantes nommées.

Convention de nommage :
- Queries  → MY_QUERY_QUERY    (ex : LIST_WORKSPACES_QUERY)
- Mutations → MY_MUTATION_MUTATION (ex : CREATE_WORKSPACE_MUTATION)
- Subscriptions → MY_SUB_SUBSCRIPTION (ex : INCIDENT_UPDATED_SUBSCRIPTION)

Le service importe depuis le fichier *.operations.ts et ne contient que la logique métier.
```

### 6. Styling conventions
```
- Utiliser SCSS, pas CSS pur
- Respecter les CSS variables de PrimeNG
- Pas de styles inline (sauf exceptions)
- Suivre BEM ou une convention cohérente
- Variables de couleur centralisées dans styles/variables.scss
```

### 7. TypeScript strict mode
```
- "strict": true dans tsconfig.json
- Typer TOUTES les variables et paramètres
- Pas de 'any', utiliser des interfaces
- Utiliser les enums pour les constantes
```

### 8. Conventions de nommage
```
- Composants: PascalCase (app.component.ts)
- Services: PascalCase avec .service (auth.service.ts)
- Fichiers: kebab-case (my-component.component.ts)
- Variables: camelCase
- Constantes: UPPER_SNAKE_CASE
- Interfaces: PascalCase avec I prefix ou sans
```

---

## 📝 Checklist pour chaque implémentation

Avant de créer un composant, Claude doit vérifier:

- [ ] Le composant existe-t-il déjà en PrimeNG ?
- [ ] Le dossier est-il au bon endroit ?
- [ ] Les imports sont-ils corrects (depuis primeng/*, pas depuis le chemin brut) ?
- [ ] Le module partagé exporte-t-il le composant PrimeNG ?
- [ ] TypeScript strict mode respecté ?
- [ ] Les noms suivent les conventions ?
- [ ] SCSS utilisé au lieu de CSS ?
- [ ] Les services sont-ils injectés correctement ?
- [ ] Observable/Signal utilisé pour l'async ?
- [ ] Le code est-il testé (au moins les cas principaux) ?

Avant d'ajouter une opération GraphQL, Claude doit vérifier :

- [ ] Un fichier `graphql/*.operations.ts` existe-t-il déjà pour ce module ?
- [ ] Si non, le créer à `core/graphql/` ou `features/[f]/graphql/`
- [ ] La constante suit la convention de nommage (`MY_OP_QUERY` / `MY_OP_MUTATION`) ?
- [ ] Le service importe depuis le fichier `*.operations.ts` et ne déclare pas de chaîne GQL en inline ?

---

## 🚀 Commandes de référence

```bash
# Créer un nouveau projet
ng new my-app

# Ajouter PrimeNG
ng add primeng

# Créer un composant
ng generate component features/my-feature/components/my-component

# Créer un service
ng generate service features/my-feature/services/my-service

# Lancer le dev server
ng serve

# Build production
ng build --configuration production

# Tests
ng test
ng e2e
```

---

## 🔗 Ressources supplémentaires

### Outils & IDEs
- **VS Code**: https://code.visualstudio.com/
- **VS Code Angular Extension**: https://marketplace.visualstudio.com/items?itemName=Angular.ng-template
- **Cursor IDE**: https://cursor.sh/

### Community & Support
- **Angular Community**: https://angular.io/community
- **Stack Overflow Angular Tag**: https://stackoverflow.com/questions/tagged/angular
- **PrimeNG GitHub Issues**: https://github.com/primefaces/primeng/issues

### Learning Resources
- **Angular University**: https://angular-university.io/
- **PrimeNG Tutorial**: https://www.youtube.com/results?search_query=primeng+tutorial
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## ⚙️ Configuration TypeScript (tsconfig.json)

Demande à Claude de utiliser cette configuration:

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"],
    "paths": {
      "@app/*": ["src/app/*"],
      "@components/*": ["src/app/components/*"],
      "@services/*": ["src/app/services/*"],
      "@models/*": ["src/app/models/*"],
      "@shared/*": ["src/app/shared/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

---

## 📌 Important: Ce que Claude DOIT faire

1. ✅ Toujours utiliser la structure recommandée
2. ✅ Respecter les conventions de nommage Angular
3. ✅ Utiliser PrimeNG pour tous les éléments UI
4. ✅ Écrire du TypeScript strict mode
5. ✅ Créer des services réutilisables
6. ✅ Utiliser RxJS/Signals pour l'async
7. ✅ Respecter les principes SOLID
8. ✅ Ajouter des commentaires pour les logiques complexes
9. ✅ Tester les composants créés
10. ✅ Respecter ce CLAUDE.md en priorité
11. ✅ Placer toutes les opérations GraphQL dans `*.operations.ts` (jamais inline dans les services)

---

## 📌 Important: Ce que Claude ne doit PAS faire

1. ❌ Créer des composants custom si PrimeNG le fournit
2. ❌ Utiliser CSS au lieu de SCSS
3. ❌ Importer directement depuis des chemins bruts (utiliser les alias)
4. ❌ Mettre du CSS inline excessivement
5. ❌ Ne pas typer (pas de 'any')
6. ❌ Mélanger logique métier et présentation
7. ❌ Créer des singletons non dans core/
8. ❌ Ignorer les themes PrimeNG existants
9. ❌ Ne pas respecter la hiérarchie des modules
10. ❌ Ajouter des dépendances sans justification
11. ❌ Déclarer des queries/mutations GraphQL directement dans un service

---

## 🎯 Résumé pour Claude

**Quand Claude crée quelque chose, il doit:**
1. Vérifier ce CLAUDE.md en premier
2. Respecter la structure de dossiers
3. Utiliser PrimeNG pour l'UI
4. Respecter les conventions Angular
5. Utiliser TypeScript strict mode
6. Placer les opérations GraphQL dans `*.operations.ts`
7. Référencer les documentations listées ci-dessus

**Questions à se poser avant de coder:**
- Est-ce conforme au CLAUDE.md ?
- Ai-je utilisé PrimeNG ?
- Ai-je respecté la structure Angular ?
- Ai-je typé correctement en TypeScript ?
- Est-ce réutilisable et testable ?
- Les opérations GraphQL sont-elles dans un fichier `*.operations.ts` dédié ?

---

**Dernière mise à jour**: 25 Mai 2026
**Format**: CLAUDE.md pour Claude Code dans Cursor
