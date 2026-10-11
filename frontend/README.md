# IBIG PARTNERS — Plateforme d'affiliation multi-niveaux

Plateforme centralisée d'affiliation pour **IBIG SARL** (Abidjan, Côte d'Ivoire).  
8 branches métiers · Réseau MLM 3 niveaux · Espace partenaire + SuperAdmin.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | **Next.js** (App Router, Server Actions, Turbopack) |
| Base de données | **Supabase PostgreSQL** (prod) · SQLite optionnel (dev local) |
| ORM | **Prisma 6** |
| Auth | **JWT HS256** (jose) + **bcryptjs** |
| UI | **Tailwind CSS v4** |
| Emails | **Resend** (domaine `mail.ibigpartners.com`) |
| Paiements | **Moneroo** (gateway Afrique) |
| Déploiement | **Vercel** — projet `prj_Y8Ao2OZi0jKEtiAInYHXXmbDOh1Q` |
| Repo | github.com/ibinter/ibig-partners |

---

## Démarrage local rapide

```bash
cd frontend

# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env.local (voir section Variables d'env ci-dessous)

# 3. Synchroniser le schéma sur la base
npm run db:push

# 4. Insérer les données de démo
npm run db:seed

# 5. Lancer le serveur
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Variables d'environnement

### Développement local — `.env.local` dans `frontend/`

```env
# Base de données
DATABASE_URL="postgresql://postgres.zuqjuqpldnnfaoycwkcr:MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.zuqjuqpldnnfaoycwkcr:MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Auth
AUTH_SECRET="un-secret-long-et-aleatoire"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Emails (Resend)
RESEND_API_KEY="re_xxxxxxxx"
EMAIL_FROM="IBIG PARTNERS <noreply@mail.ibigpartners.com>"
SUPPORT_EMAIL="support@ibigpartners.com"

# Paiements (Moneroo)
MONEROO_SECRET_KEY="sk_live_xxxxxx"
MONEROO_WEBHOOK_SECRET="whsec_xxxxxx"  # doit être identique au Signing Secret dans le dashboard Moneroo

# API ventes affiliées (sites produits → IBIG Partners)
PARTNER_SALE_API_KEY="une_cle_secrete"
```

> ⚠️ `EMAIL_FROM` doit impérativement contenir `mail.ibigpartners.com` (pas `ibigpartners.com` tout court), sinon Resend rejette l'envoi car seul ce sous-domaine est vérifié.

> ⚠️ `MONEROO_WEBHOOK_SECRET` doit être **identique** à la valeur "Signing Secret" affichée dans le dashboard Moneroo. Si elles divergent, le webhook retourne 401 et aucune vente en ligne n'est enregistrée.

### Production (Vercel)

Les mêmes variables sont configurées dans **Vercel → Settings → Environment Variables**.  
Après toute modification d'une variable sur Vercel, il faut **Redeploy** pour qu'elle soit prise en compte.

---

## Comptes de démonstration (créés par `db:seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| **SuperAdmin** | admin@ibigpartners.com | password123 |
| **Partenaire actif (N1)** | koffi@example.com | password123 |
| **Partenaire (N2, filleul de Koffi)** | aya@example.com | password123 |
| **Partenaire (N3, filleul d'Aya)** | moussa@example.com | password123 |
| **Partenaire en attente** | fatou@example.com | password123 |

---

## Toutes les pages de l'application

### Pages publiques

| URL | Description |
|---|---|
| `/` | Landing page (présentation, calculateur, hall of fame) |
| `/rejoindre` | Inscription partenaire (avec code parrain optionnel) |
| `/connexion` | Connexion |
| `/branches` | Présentation des 8 branches métiers |
| `/produits` | Catalogue des produits affiliables |
| `/top-partenaires` | Hall of Fame public (top recruteurs) |
| `/missions` | Liste des missions ouvertes (publique) |
| `/missions/[id]` | Détail d'une mission |
| `/p/[code]` | Page de profil public d'un partenaire |
| `/aff/[code]` | Tracking affiliation (pose le cookie `ibig_ref` 90 jours) |

### Espace partenaire (`/espace/*` — protégé)

| URL | Description |
|---|---|
| `/espace` | Tableau de bord (stats, missions démarrage, défis) |
| `/espace/produits` | Activation des liens d'affiliation par produit |
| `/espace/liens` | Liens + QR codes + partage viral 1-clic |
| `/espace/missions` | Missions disponibles, candidatures, suivi |
| `/espace/reseau` | Réseau N1/N2/N3 + soumission d'opportunités |
| `/espace/commissions` | Historique commissions + relevé PDF |
| `/espace/kit` | Kit marketing (selon statut) |
| `/espace/prospects` | CRM prospects |
| `/espace/coach` | Coach IA (chat contextuel en français) |
| `/espace/academie` | Modules de formation + certificat PDF |
| `/espace/profil` | Coordonnées + méthode de paiement |

### Espace SuperAdmin (`/admin/*` — protégé, rôle ADMIN)

| URL | Description |
|---|---|
| `/admin` | Tableau de bord admin |
| `/admin/partenaires` | Gestion partenaires (validation, suspension, niveaux) |
| `/admin/missions` | Création, validation et suivi des missions |
| `/admin/ventes` | Enregistrement et suivi des ventes |
| `/admin/commissions` | Validation des commissions |
| `/admin/paiements` | Ordres de virement |
| `/admin/branches` | Activation branches & produits, taux |
| `/admin/opportunites` | Suivi des pistes B2B |
| `/admin/communication` | Envoi d'annonces aux partenaires |
| `/admin/parametres` | Paramètres plateforme |

---

## Système CP (Credits Points)

Les CP sont une monnaie de fidélité **non-cash** gagnée en accomplissant des missions.

**Valeur :** `1 CP = 10 FCFA` en remise sur les produits IBIG.

**Boost Commission :** Un partenaire peut dépenser des CP pour booster sa commission sur une vente :
- 1 000 CP → +1% sur **une** vente
- 2 000 CP → +2% sur une vente
- …
- 5 000 CP → +5% sur une vente (maximum)

Les CP sont **dépensés** (solde diminue) lors de l'utilisation du boost. Chaque boost ne s'applique qu'à **une seule candidature**. Seules les missions CASH ou MIXED permettent le boost.

**Tableau `PointTransaction`** : toutes les entrées/sorties de CP (type CREDIT ou DEBIT).

---

## Système de statuts partenaires

Le statut est calculé automatiquement selon **les ventes personnelles ET l'équipe filleuls** :

| Statut | Condition |
|---|---|
| Starter | Inscription validée |
| Silver | Seuils ventes ou filleuls (voir `lib/constants.ts`) |
| Gold | Seuils supérieurs |
| Master | Seuils élevés |
| Elite | Top partenaires |

Les CP n'influencent **pas** le statut — ils donnent uniquement des avantages supplémentaires (remises, boost commission).

---

## API partenaires (sites produits → IBIG)

Les sites des produits IBIG peuvent remonter des ventes affiliées automatiquement :

```
POST /api/partners/report-sale
Authorization: Bearer {PARTNER_SALE_API_KEY}
Content-Type: application/json

{
  "affiliateCode": "AFF-KOFFI-001",
  "productSlug": "ibig-finance",
  "amount": 50000,
  "currency": "XOF"
}
```

---

## Tracking d'affiliation

Un lien d'affiliation suit le format `/aff/[code]?p=slug-produit`.  
Il pose un cookie `ibig_ref` de **90 jours**.  
Si un visiteur s'inscrit comme partenaire dans ce délai, le parrain est automatiquement attribué.

---

## Grille de commissions

| Type | N1 | N2 | N3 |
|---|---|---|---|
| Abonnement M1 | 20% | 10% | 5% |
| Abonnement M2 | 15% | 8% | 3% |
| Abonnement M3 | 10% | 5% | 2% |
| Abonnement M4 | 5% | 3% | 1% |
| Abonnement annuel | 20% | 8% | 3% |
| Formation / Cours | 10% | 5% | 2% |
| Service / Produit | taux produit | ×0,5 | ×0,25 |

Bonus de statut : Silver +2% · Gold +5% · Master +8% (appliqué sur le taux N1).

---

## Scripts disponibles

```bash
npm run dev          # Serveur de développement (Turbopack)
npm run build        # Build de production
npm run start        # Serveur de production
npm run db:push      # Synchroniser le schéma Prisma → base
npm run db:seed      # Insérer les données de démo
npm run db:reset     # Réinitialiser la base et re-seeder
```

---

## Structure du projet

```
frontend/
  prisma/
    schema.prisma          # Schéma complet (User, Mission, Sale, PointTransaction…)
    seed.ts                # Données de démo
  src/
    app/
      (site)/              # Pages publiques (/, /rejoindre, /connexion…)
      aff/[code]/          # Tracking affiliation
      missions/            # Pages missions publiques
      espace/              # Espace partenaire (protégé)
        actions.ts         # Server actions partenaire (missions, boost CP…)
        missions/          # Pages missions partenaire
      admin/               # Espace SuperAdmin (protégé)
        actions.ts         # Server actions admin (validation missions, ventes…)
      api/                 # Routes API
        moneroo/webhook/   # Webhook paiements Moneroo
        partners/report-sale/ # API réconciliation ventes affiliées
    components/
      ui.tsx               # Composants UI réutilisables
      dashboard-shell.tsx
      site-chrome.tsx
    lib/
      auth.ts              # JWT session
      commissions.ts       # Moteur de calcul MLM
      constants.ts         # Taux, statuts, labels
      format.ts            # fcfa(), formatDate()
      metrics.ts           # partnerSummary(), getNetwork()
      prisma.ts            # Instance Prisma singleton
      sales.ts             # generateCommissionsForSale(), recomputeStatus()
    proxy.ts               # Middleware (protection des routes)
```
