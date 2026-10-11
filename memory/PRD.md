# IBIG PARTNERS — PRD & Historique des fonctionnalités

> Dernière mise à jour : octobre 2026

---

## Contexte du projet

**IBIG SARL** (Abidjan, Côte d'Ivoire) opère une plateforme d'affiliation multi-niveaux (MLM 3 niveaux) couvrant 8 branches métiers. Les partenaires recommandent les produits IBIG, gagnent des commissions sur leurs ventes directes et sur celles de leur réseau (N2 et N3).

**Objectif de la plateforme** : attirer des affiliés, les outiller pour vendre efficacement, automatiser le suivi des commissions et la gestion des paiements.

---

## Persona cible

- Affiliés africains (Côte d'Ivoire + diaspora) : étudiants, indépendants, professionnels cherchant un revenu complémentaire
- Master Partners qui construisent et managent des équipes
- Admins IBIG qui valident inscriptions, missions, ventes et paiements

---

## Stack technique actuelle

| Couche | Technologie |
|---|---|
| Framework | Next.js (App Router, Server Actions, Turbopack) |
| Base de données | Supabase PostgreSQL (`zuqjuqpldnnfaoycwkcr`) |
| ORM | Prisma 6 |
| Auth | JWT HS256 (jose) + bcryptjs |
| UI | Tailwind CSS v4 + TypeScript |
| Emails | Resend (domaine `mail.ibigpartners.com` vérifié) |
| Paiements | Moneroo (gateway Afrique) |
| Déploiement | Vercel (`prj_Y8Ao2OZi0jKEtiAInYHXXmbDOh1Q`) |

---

## Fonctionnalités implémentées

### Vague 1 — Conversion landing ✅
- Bandeau Social Proof Bar (stats temps réel)
- Calculateur LIVE (3 sliders + statut → revenu estimé)
- Hall of Fame : podium top 3 + classement top 4–8
- Témoignages avec montants réels
- Sticky Mobile CTA (barre flottante d'inscription au scroll)

### Vague 2 — Onboarding gamifié ✅
- Mission Démarrage : checklist 5 étapes sur le dashboard avec progression
- Détection auto des étapes (profil, branche, lien, prospect)
- Confettis sur chaque étape
- 500 CP totaux + déblocage badges

### Vague 3 — Partage viral 1-clic ✅
- Composant ViralShare sur `/espace/liens`
- 3 tonalités de message (Pro / Convaincant / Personnel) pré-rédigées
- Boutons WhatsApp, Facebook, Telegram, X, Instagram
- Copie du lien en 1-clic

### Vague 4 — Coach IA ✅
- Page `/espace/coach` avec chat conversationnel en français
- Contexte injecté : nom, statut, ville, code affilié
- 6 raccourcis intelligents (WhatsApp, Relance, Pitch 30s, Plan Gold…)

### Vague 5 — Notifications & célébrations ✅
- CelebrationToaster global sur layout `/espace/*`
- Polling toutes les 60s → toasts avec confettis sur ventes/paiements/badges
- Persistance localStorage des notifs vues

### Vague 6 — Académie certifiante ✅
- Barre de progression sur `/espace/academie`
- Seuil 80% → certificat PDF débloqué
- Génération PDF côté client (jsPDF) avec design premium

### Vague 7 — Défis hebdo ✅
- Composant WeeklyChallenge sur dashboard
- Objectif : 3 ventes / semaine = bonus +5 000 FCFA
- Countdown live

### Vague 8 — Social & SEO ✅
- CelebrationToaster repositionné (ne cache plus le menu)
- Parrain du Mois sur dashboard (top recruteur + bonus +5% sur 30j)
- Page publique `/top-partenaires` (Hall of Fame étendu, SEO)
- OG Image dynamique `/api/og?code=XXX&product=YYY` (1200×630, personnalisée)
- Liens nav "Top Partenaires" dans header et footer

### Vague 9 — Missions Partners ✅
- **Système de missions** : l'admin crée des missions (CASH / CP / MIXED), les partenaires candidatent, soumettent une preuve, l'admin valide
- Types de récompenses : CASH (commission fixe), CP (points), MIXED (CP + cash sur vente confirmée)
- Workflow complet : OPEN → APPLIED → SUBMITTED → VALIDATED/REJECTED
- Admin : création, validation preuves, gestion des candidatures
- Public : liste des missions ouvertes sur `/missions` et `/missions/[id]`
- Partenaire : espace `/espace/missions` avec suivi de ses candidatures

### Vague 10 — Système CP (Credits Points) ✅
- **CP = monnaie de fidélité non-cash** : gagnés en accomplissant des missions
- **Valeur** : 1 CP = 10 FCFA en remise sur les produits IBIG
- **Boost Commission** : dépenser 1 000 CP = +1% sur UNE vente (max 5 000 CP = +5%)
  - CP débités du solde à l'activation du boost
  - Applicable uniquement sur missions CASH ou MIXED
  - Un seul boost par candidature
- CP divisés par 10 sur toutes les missions pour donner de la valeur (ex : 500 CP → 50 CP)
- Table `PointTransaction` : toutes les entrées/sorties (CREDIT/DEBIT)
- Colonne `cpBoostUsed` sur `MissionApplication`
- Admin : applique automatiquement le boost% sur la commission lors de la validation

### Intégrations techniques ✅
- **Resend** : emails transactionnels (bienvenue, validation mission, commissions)
- **Moneroo** : paiements en ligne avec webhook `/api/moneroo/webhook`
- **API réconciliation** : `POST /api/partners/report-sale` — les sites produits remontent les ventes affiliées automatiquement (clé `PARTNER_SALE_API_KEY`)

---

## Système de statuts partenaires

Le statut est calculé sur les **ventes personnelles ET l'équipe filleuls** (pas les CP) :

| Statut | Critères |
|---|---|
| Starter | Inscription validée |
| Silver | Seuils ventes ou réseau (voir `lib/constants.ts`) |
| Gold | Seuils supérieurs |
| Master | Seuils élevés |
| Elite | Top partenaires |

Bonus de commission par statut : Silver +2% · Gold +5% · Master +8%.

---

## Grille de commissions MLM

| Type de produit | N1 (partenaire direct) | N2 | N3 |
|---|---|---|---|
| Abonnement M1 | 20% | 10% | 5% |
| Abonnement M2 | 15% | 8% | 3% |
| Abonnement M3 | 10% | 5% | 2% |
| Abonnement M4 | 5% | 3% | 1% |
| Abonnement annuel | 20% | 8% | 3% |
| Formation / Cours | 10% | 5% | 2% |
| Service / Produit | taux du produit | ×0,5 | ×0,25 |

---

## Backlog & prochaines priorités

### Priorité haute
- [ ] Afficher le solde CP visible et permanent dans l'espace partenaire (header ou dashboard)
- [ ] Page dédiée `/espace/cp` : historique des transactions CP, remises disponibles
- [ ] Implémenter les remises CP sur les produits (1 CP = 10 FCFA)

### Priorité moyenne
- [ ] Accès prioritaire aux missions premium pour les partenaires avec beaucoup de CP
- [ ] Notifications push web (Service Worker)
- [ ] Coach IA streaming token par token (SSE)

### Priorité basse
- [ ] A/B test des messages de partage
- [ ] Application mobile native (Capacitor)
- [ ] 25 produits avec `siteUrl` manquant (à renseigner)
- [ ] Nettoyer la branche EDUFORM dupliquée (slug `eduform` inactif vs `ibig-eduform` actif)

---

## Contraintes et règles à respecter

1. **EMAIL_FROM** : toujours `... <noreply@mail.ibigpartners.com>` (avec le `mail.`)
2. **MONEROO_WEBHOOK_SECRET** : identique au Signing Secret du dashboard Moneroo
3. **Missions CP** : pas de boost commission sur les missions de type CP pur
4. **Boost CP** : 1 000–5 000 CP, multiple de 1 000, un seul boost par candidature, CP déduits immédiatement
5. **Commission MIXED** : le cash est bloqué jusqu'à confirmation d'une vente réelle via `/api/admin/confirm-sale`
6. **Statuts partenaires** : calculés sur ventes/filleuls, jamais sur les CP
