# Déploiement Vercel — IBIG PARTNERS

> Ce guide décrit l'état actuel du déploiement en production. Le projet est **déjà déployé** sur Vercel et connecté à Supabase.

---

## Infos déploiement actuel

| Élément | Valeur |
|---|---|
| **URL production** | https://ibigpartners.com |
| **Projet Vercel** | `prj_Y8Ao2OZi0jKEtiAInYHXXmbDOh1Q` |
| **Team Vercel** | `team_v556TXNBdOuIagRrN0qo5qBB` |
| **Repo GitHub** | github.com/ibinter/ibig-partners |
| **Base de données** | Supabase PostgreSQL — projet `zuqjuqpldnnfaoycwkcr` |
| **Root Directory Vercel** | `frontend` |

---

## Comment déployer une mise à jour

Chaque `git push` sur la branche `main` déclenche automatiquement un déploiement sur Vercel.

```bash
git add .
git commit -m "Description de la modification"
git push origin main
```

Vercel build et déploie automatiquement. Suivre l'avancement sur https://vercel.com/ibig/ibig-partners.

---

## Variables d'environnement (Vercel)

Ces variables sont configurées dans **Vercel → Settings → Environment Variables**.

> ⚠️ Après toute modification d'une variable, cliquer **"Redeploy"** sur le dernier déploiement pour qu'elle soit prise en compte.

| Variable | Description | Valeur attendue |
|---|---|---|
| `DATABASE_URL` | URL pooler Supabase (transactions) | `postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | URL directe Supabase (migrations) | `postgresql://...@pooler.supabase.com:5432/postgres` |
| `AUTH_SECRET` | Clé secrète JWT (long et aléatoire) | Généré avec `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | `https://ibigpartners.com` |
| `RESEND_API_KEY` | Clé API Resend pour les emails | `re_xxxxxxxxxx` |
| `EMAIL_FROM` | Expéditeur des emails | `IBIG PARTNERS <noreply@mail.ibigpartners.com>` |
| `SUPPORT_EMAIL` | Email de support visible | `support@ibigpartners.com` |
| `MONEROO_SECRET_KEY` | Clé privée Moneroo | `sk_live_xxxxxxxxx` |
| `MONEROO_WEBHOOK_SECRET` | Secret de signature webhook | Copier depuis Moneroo Dashboard → Webhooks → Signing Secret |
| `PARTNER_SALE_API_KEY` | Clé API pour sites produits | Généré et partagé avec les sites partenaires |

### Règles importantes à ne jamais oublier

**EMAIL_FROM** : doit impérativement utiliser `mail.ibigpartners.com` (avec le `mail.`).  
Le domaine `mail.ibigpartners.com` est vérifié dans Resend. Si on met `ibigpartners.com` seul, Resend rejette l'envoi.

**MONEROO_WEBHOOK_SECRET** : doit être **identique** au "Signing Secret" affiché dans le dashboard Moneroo.  
Si les deux valeurs divergent : le webhook retourne 401, les paiements en ligne ne sont pas enregistrés, et aucune vente n'est créée automatiquement.

---

## Supabase — Base de données

**Projet** : `zuqjuqpldnnfaoycwkcr` (région : eu-central-1)

### Accéder à la base

- Dashboard : https://supabase.com/dashboard/project/zuqjuqpldnnfaoycwkcr
- Table Editor pour voir les données directement
- SQL Editor pour des requêtes manuelles

### Mettre à jour le schéma après une modification Prisma

Après une modification de `frontend/prisma/schema.prisma` :

```bash
cd frontend

# Option 1 — pousser directement (dev/staging)
npx prisma db push

# Option 2 — créer une migration versionnée (recommandé pour prod)
npx prisma migrate dev --name "description_de_la_migration"
npx prisma migrate deploy
```

> Pour les petites modifications en urgence, il est possible d'exécuter du SQL directement dans le SQL Editor de Supabase.

---

## Resend — Emails transactionnels

**Domaine vérifié** : `mail.ibigpartners.com`

Les emails suivants sont envoyés automatiquement :
- Bienvenue à l'inscription
- Validation/rejet de candidature mission
- Notification de commission
- Réinitialisation de mot de passe

### En cas de problème d'envoi

1. Vérifier que `EMAIL_FROM` sur Vercel contient bien `mail.ibigpartners.com`
2. Vérifier les logs dans le dashboard Resend
3. Redéployer sur Vercel si la variable vient d'être modifiée

---

## Moneroo — Paiements en ligne

**Webhook URL** : `https://ibigpartners.com/api/moneroo/webhook`

Ce webhook est appelé par Moneroo après chaque paiement réussi. Il :
1. Vérifie la signature avec `MONEROO_WEBHOOK_SECRET`
2. Crée la vente dans la base
3. Génère les commissions MLM pour le partenaire et ses parrains

### En cas de paiements non enregistrés

1. Aller dans Moneroo Dashboard → Webhooks
2. Vérifier que l'URL pointe bien sur `ibigpartners.com`
3. Copier le "Signing Secret" et le comparer à `MONEROO_WEBHOOK_SECRET` sur Vercel
4. Si différent : mettre à jour sur Vercel + Redeploy

---

## API réconciliation ventes affiliées

Les sites des produits IBIG (EDUFORM, etc.) peuvent signaler des ventes via :

```
POST https://ibigpartners.com/api/partners/report-sale
Authorization: Bearer {PARTNER_SALE_API_KEY}
Content-Type: application/json

{
  "affiliateCode": "AFF-KOFFI-001",
  "productSlug": "ibig-finance",
  "amount": 50000,
  "currency": "XOF"
}
```

La clé `PARTNER_SALE_API_KEY` doit être partagée avec chaque site produit qui utilise cette API.

---

## Déploiement initial (historique — déjà fait)

Cette section décrit ce qui a été fait lors du premier déploiement. Elle est conservée pour référence.

### Ce qui a été configuré

1. Root Directory = `frontend` dans Vercel Settings
2. Supabase créé, URLs copiées dans Vercel
3. `npx prisma db push` exécuté pour créer les tables
4. `npm run db:seed` exécuté pour les données initiales
5. Domaine `ibigpartners.com` ajouté dans Vercel → Domains
6. DNS configurés chez le registrar
7. Resend : domaine `mail.ibigpartners.com` vérifié (enregistrements DNS ajoutés)
8. Moneroo : webhook configuré sur l'URL de production

---

## Dépannage

**Build échoue avec une erreur TypeScript**  
→ Vérifier que le code compile localement : `npm run build`

**Pages `/espace/*` retournent 401 après connexion**  
→ Vérifier que `AUTH_SECRET` est configurée et identique entre tous les environnements

**Emails non reçus**  
→ Vérifier `EMAIL_FROM` = `... <noreply@mail.ibigpartners.com>` (avec le `mail.`)  
→ Vérifier `RESEND_API_KEY` dans Vercel  
→ Redéployer si variable modifiée

**Paiements Moneroo non enregistrés**  
→ Vérifier que `MONEROO_WEBHOOK_SECRET` = Signing Secret du dashboard Moneroo  
→ Vérifier les logs du webhook dans Moneroo Dashboard

**Erreur Prisma "prepared statement already exists"**  
→ Normal avec pgBouncer. Vérifier que `DATABASE_URL` contient `&pgbouncer=true` et que `DIRECT_URL` n'en a pas.

**Variable d'env modifiée mais pas prise en compte**  
→ Aller sur Vercel → Deployments → cliquer sur "..." → Redeploy
