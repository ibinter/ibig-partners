# IBIG PARTNERS — Plateforme d'affiliation multi-niveaux

Plateforme centralisée d'affiliation pour **IBIG SARL** (Abidjan, Côte d'Ivoire).  
8 branches métiers · Réseau MLM 3 niveaux · Espace partenaire + SuperAdmin.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **Prisma 6** + **SQLite** (dev) — compatible PostgreSQL pour la production
- **Tailwind CSS v4**
- **jose** (JWT HS256) + **bcryptjs** (hash mots de passe)

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Créer la base de données et appliquer le schéma
npm run db:push

# 3. Insérer les données de démonstration
npm run db:seed

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Variables d'environnement (`.env`)

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="ibig-partners-dev-secret-change-me-in-production-please-0123456789"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **Production** : remplacez `DATABASE_URL` par une URL PostgreSQL et changez `AUTH_SECRET`.

## Comptes de démonstration

| Rôle | Email | Mot de passe | Code partenaire |
|---|---|---|---|
| **SuperAdmin** | admin@ibigpartners.com | password123 | — |
| **Partenaire N1** | koffi@example.com | password123 | AFF-KOFFI-001 |
| **Partenaire N2** (filleul de Koffi) | aya@example.com | password123 | AFF-AYA-002 |
| **Partenaire N3** (filleul d'Aya) | moussa@example.com | password123 | AFF-MOUSSA-003 |
| **Partenaire en attente** | fatou@example.com | password123 | AFF-FATOU-004 |

## Espaces principaux

| URL | Description |
|---|---|
| `/` | Site public (présentation, branches) |
| `/rejoindre` | Inscription partenaire (avec code parrain optionnel) |
| `/connexion` | Connexion |
| `/espace` | Tableau de bord partenaire |
| `/espace/produits` | Activation des liens d'affiliation |
| `/espace/liens` | Liens + QR codes |
| `/espace/reseau` | Réseau N1/N2/N3 + soumission d'opportunités |
| `/espace/commissions` | Historique des commissions + relevé PDF |
| `/espace/kit` | Kit marketing (selon statut) |
| `/espace/prospects` | CRM prospects |
| `/espace/profil` | Coordonnées + méthode de paiement |
| `/admin` | Tableau de bord SuperAdmin |
| `/admin/partenaires` | Gestion des partenaires (validation, suspension) |
| `/admin/ventes` | Enregistrement et suivi des ventes |
| `/admin/commissions` | Validation des commissions |
| `/admin/paiements` | Ordres de virement |
| `/admin/branches` | Activation branches & produits, taux |
| `/admin/opportunites` | Suivi des pistes B2B |
| `/admin/communication` | Envoi d'annonces |
| `/admin/parametres` | Paramètres plateforme (SuperAdmin uniquement) |

## Tracking d'affiliation

Un lien d'affiliation suit le format `/aff/[code]?p=slug-produit`.  
Il pose un cookie `ibig_ref` de **90 jours**.  
Si un visiteur s'inscrit comme partenaire dans ce délai, le parrain est automatiquement attribué.

## Grille de commissions

| Type | N1 | N2 | N3 |
|---|---|---|---|
| Abonnement mensuel M1 | 20% | 10% | 5% |
| Abonnement mensuel M2 | 15% | 8% | 3% |
| Abonnement mensuel M3 | 10% | 5% | 2% |
| Abonnement mensuel M4 | 5% | 3% | 1% |
| Abonnement annuel | 20% | 8% | 3% |
| Formation / Cours | 10% | 5% | 2% |
| Service / Produit | taux produit | ×0,5 | ×0,25 |

Bonus de statut : Silver +2% · Gold +5% · Master +8% (appliqué sur le taux N1 du bénéficiaire).

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run db:push      # Synchroniser le schéma Prisma → DB
npm run db:seed      # Insérer les données de démo
npm run db:reset     # Réinitialiser la DB et re-seeder
```

## Structure du projet

```
src/
  app/
    (site)/          # Pages publiques (/, /rejoindre, /connexion)
    aff/[code]/      # Route de tracking affiliation
    espace/          # Espace partenaire (protégé)
    admin/           # Espace SuperAdmin (protégé)
    auth-actions.ts  # Server actions auth (login, register, logout)
  components/
    ui.tsx           # Composants UI réutilisables
    dashboard-shell.tsx
    site-chrome.tsx
  lib/
    auth.ts          # JWT session (jose)
    commissions.ts   # Moteur de calcul MLM
    constants.ts     # Taux, statuts, labels
    format.ts        # fcfa(), formatDate()
    metrics.ts       # partnerSummary(), getNetwork()
    prisma.ts        # Instance Prisma singleton
    sales.ts         # generateCommissionsForSale(), recomputeStatus()
  proxy.ts           # Middleware Next.js 16 (protection des routes)
prisma/
  schema.prisma
  seed.ts
```
