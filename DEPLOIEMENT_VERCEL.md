# 🚀 Déploiement Vercel — IBIG PARTNERS

## Étape 1 — Pousser le code sur GitHub

Dans Emergent, cliquez sur **"Save to Github"** (bouton en haut à droite). Cela poussera tout le code amélioré (les 7 vagues) dans votre repo `ibinter/ibig-partners`.

> **Important** : Vercel doit pointer sur le dossier `frontend/` du repo (puisque c'est là qu'est le projet Next.js).

## Étape 2 — Configurer Vercel

Sur https://vercel.com/ibig/ibig-partners :

### 2.1 — Settings → General → Root Directory
Mettre **`frontend`** (puisque le projet Next.js est dans le sous-dossier `/frontend`).

### 2.2 — Settings → Build & Development
- **Framework Preset** : Next.js (auto-détecté)
- **Build Command** : `npm run build` (par défaut)
- **Install Command** : `npm install`
- **Output Directory** : (par défaut)

### 2.3 — Settings → Environment Variables

Ajoutez ces variables (Production + Preview) :

| Variable | Valeur | Où l'obtenir |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require&pgbouncer=true` | Supabase / Neon / Vercel Postgres |
| `DIRECT_URL` | Idem mais sans `pgbouncer=true` | Idem (URL "Direct Connection") |
| `AUTH_SECRET` | Long secret aléatoire | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://ibigpartners.com` (ou votre URL Vercel) | — |
| `EMERGENT_LLM_KEY` | `sk-emergent-24fBcA37e7b8eE005B` | Coach IA |
| `RESEND_API_KEY` | `re_xxxxx` (optionnel) | https://resend.com |
| `EMAIL_FROM` | `IBIG PARTNERS <noreply@ibigpartners.com>` | — |
| `SUPPORT_EMAIL` | `support@ibigpartners.com` | — |
| `MONEROO_SECRET_KEY` | `sk_live_xxxxx` (optionnel) | https://moneroo.io |
| `MONEROO_WEBHOOK_SECRET` | `whsec_xxxxx` (optionnel) | Moneroo Dashboard |

## Étape 3 — Choisir une base PostgreSQL

### Option A — Supabase (gratuit, recommandé)
1. Créer un compte sur https://supabase.com
2. Créer un projet "ibig-partners"
3. Aller dans **Project Settings → Database**
4. Copier l'URL de connexion **"Transaction" pooler** (port 6543) → `DATABASE_URL` (ajouter `&pgbouncer=true`)
5. Copier l'URL **"Direct connection"** (port 5432) → `DIRECT_URL`

### Option B — Vercel Postgres (le plus simple si déjà sur Vercel)
1. Sur Vercel → Storage → Create Database → Postgres
2. Sélectionner votre projet → Vercel injecte automatiquement les variables `POSTGRES_URL`
3. ⚠️ Renommer en `DATABASE_URL` et `DIRECT_URL` dans Settings

### Option C — Neon (gratuit)
1. Créer compte sur https://neon.tech
2. Créer projet → copier la connection string → `DATABASE_URL` (et `DIRECT_URL`)

## Étape 4 — Initialiser la base en production

Après le 1er déploiement réussi, **localement** :

```bash
# Cloner ton repo si pas déjà fait
git clone https://github.com/ibinter/ibig-partners.git
cd ibig-partners/frontend

# Installer les dépendances
npm install

# Créer un .env local avec les URLs de prod
cat > .env <<EOF
DATABASE_URL="postgresql://...la_même_que_sur_vercel..."
DIRECT_URL="postgresql://...idem..."
EOF

# Pousser le schéma sur la base prod
npm run db:push

# Seeder les données initiales (branches, produits, comptes démo)
npm run db:seed
```

> ⚠️ Le `db:seed` crée des comptes de démo. En vrai prod, vous devriez seulement seeder les **branches** et **produits**. Pour éviter les comptes démo, utilisez `npx tsx prisma/seed.production.ts` si ce fichier est adapté.

## Étape 5 — Configurer le webhook Moneroo (si paiements activés)

Dans le dashboard Moneroo :
- **Webhook URL** : `https://votre-domaine.vercel.app/api/moneroo/webhook`

## Étape 6 — Domaine personnalisé

Sur Vercel → Settings → Domains :
- Ajouter `ibigpartners.com`
- Suivre les instructions DNS (CNAME ou A record)
- Mettre à jour `NEXT_PUBLIC_SITE_URL` avec votre domaine final

## ✅ Checklist finale avant mise en ligne

- [ ] Code poussé sur GitHub via "Save to Github"
- [ ] Root Directory = `frontend` sur Vercel
- [ ] Toutes les variables d'env configurées
- [ ] Base PostgreSQL créée et URLs renseignées
- [ ] `db:push` exécuté pour créer les tables
- [ ] `db:seed` exécuté pour les données initiales
- [ ] Test du login avec un compte admin
- [ ] Test du Coach IA (envoie un message dans /espace/coach)
- [ ] Domaine custom configuré
- [ ] Webhook Moneroo configuré (si paiements)

## 🆘 Dépannage

**Build échoue avec "Module not found: react-is"** → Déjà résolu (ajouté à package.json).

**Erreur Prisma "Datasource provider sqlite ≠ postgresql"** → Déjà résolu (schema en postgresql).

**Coach IA renvoie "EMERGENT_LLM_KEY manquante"** → Vérifier que la variable est bien dans Vercel Environment Variables (toutes les envs : Production, Preview, Development).

**Server Actions bloquées par CORS** → Déjà résolu via `serverActions.allowedOrigins` dans `next.config.ts`. Ajoutez votre domaine custom si vous en mettez un.

**Pages /espace/* retournent 401** → Cookies cross-domain : vérifier que `AUTH_SECRET` est bien configurée et que le domaine est cohérent.

---

**Une fois en ligne, partagez votre URL pour qu'on valide ensemble que tout fonctionne ! 🚀**
