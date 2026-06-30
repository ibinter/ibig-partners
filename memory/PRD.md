# IBIG PARTNERS — PRD & Historique

## Problème initial
> "JE SOUHAITE AMELIORER LA PLATEFORME IBIG PARTNERS AJOUTER DES FONCTIONNALITES PLUS FLUIDES PLUS COHERENT ET RENDRE MEILLEUR AFIN QUE CA PUISSE ATTIRER LE MAXIMUM D'AFFILIE QUI VONT SINTERRESSE A MON PROJET ET MAIDER A VENDRE AU MIEUX."

## Stack technique
- **Frontend** : Next.js 16 (App Router, Turbopack, Server Actions) + Tailwind v4 + TypeScript
- **Backend** : FastAPI (proxy reverse vers Next.js sur port 3000) + Python coach IA via emergentintegrations
- **DB** : SQLite en dev (Prisma 6) — compatible PostgreSQL
- **Auth** : JWT (jose) + bcryptjs
- **IA** : Emergent Universal LLM Key (modèle openai/gpt-5.4-mini)
- **Source** : github.com/ibinter/ibig-partners

## Architecture infra
- Le projet Next.js tourne sur `/app/frontend` via supervisor (`yarn start` = `next dev -p 3000`)
- Le FastAPI `/app/backend/server.py` agit comme proxy : `/api/coach/*` géré localement, reste forwardé vers Next.js
- Variables d'env essentielles : `EMERGENT_LLM_KEY`, `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`

## Persona cible
- Affiliés africains (Côte d'Ivoire majoritairement + diaspora) — étudiants, indépendants, professionnels cherchant un revenu complémentaire
- Master Partners qui construisent des équipes
- Admins IBIG qui valident les inscriptions et paiements

## Améliorations implémentées (Vagues 1–7)

### Wave 1 — Conversion landing ✅
- Bandeau **Social Proof Bar** avec stats temps réel (partenaires, ventes, versements, inscrits)
- **Calculateur LIVE** avec 3 sliders + sélecteur de statut → revenu mensuel et annuel calculés en temps réel
- **Hall of Fame** : podium top 3 + classement top 4–8 du mois (données réelles + fallback démo)
- **Témoignages** avec montants réels affichés (Koffi 342k, Aya 187k, etc.)
- **Sticky Mobile CTA** : barre flottante d'inscription qui apparaît au scroll mobile

### Wave 2 — Onboarding gamifié ✅
- **Mission Démarrage** : checklist 5 étapes sur le dashboard avec progression %
- Détection auto des étapes faites (profil, branche activée, lien copié, prospect créé)
- Confettis sur chaque étape complétée
- 500 points totaux + déblocage badges

### Wave 3 — Partage viral 1-clic ✅
- Composant **ViralShare** intégré sur `/espace/liens` pour chaque produit
- 3 tonalités de message (Pro / Convaincant / Personnel) pré-rédigées
- Boutons natifs WhatsApp, Facebook, Telegram, X, Instagram (couleurs officielles)
- Copie du lien en 1-clic

### Wave 4 — Coach IA ✅
- Page `/espace/coach` avec chat conversationnel
- Backend Python `/api/coach/chat` utilisant `emergentintegrations` (openai gpt-5.4-mini)
- 6 raccourcis intelligents : Message WhatsApp, Relance, Quel produit, Pitch 30s, Plan Gold, Convaincre filleul
- Contexte injecté : nom, statut, ville, code affilié
- Animations dots typing pendant chargement

### Wave 5 — Notifications & célébrations ✅
- Composant **CelebrationToaster** global sur layout `/espace/*`
- Polling `/api/notifications/recent` toutes les 60s
- Toast premium top-right avec confettis sur événements (ventes, paiements, badges)
- Persistance localStorage des notifs vues

### Wave 6 — Académie certifiante ✅
- **CertificationBanner** sur `/espace/academie`
- Barre de progression visuelle
- Seuil 80% modules complétés → certificat PDF débloqué
- Génération PDF côté client (jsPDF) avec design premium (bordure dorée, nom partenaire, code, date, ID unique)

### Wave 7 — Défis hebdo ✅
- Composant **WeeklyChallenge** sur dashboard
- Objectif fixe : 3 ventes / semaine = bonus +5 000 FCFA
- Countdown live (jours/heures/minutes restants)
- Barre de progression colorée

## Compte rendu

### Ce qui marche en bout-en-bout
- Landing publique : tous les nouveaux composants chargent et s'affichent (calculator, social proof, hall of fame, testimonials, sticky CTA)
- Dashboard partenaire : onboarding quest, weekly challenge, celebration toaster
- /espace/liens : viral share avec tous les boutons sociaux
- /espace/coach : chat IA français complet avec réponses contextualisées
- /espace/academie : certification banner avec PDF download

### Backlog & Améliorations futures
- **P0** : Connecter localStorage du onboarding au backend pour persister vraiment (actuellement client only)
- **P1** : Génération vrai OG image dynamique (Next.js `/api/og` route)
- **P1** : Hall of Fame en page dédiée `/top-partenaires` accessible publiquement
- **P1** : Notifications push web (Service Worker)
- **P2** : Coach IA streaming token par token (SSE)
- **P2** : A/B tester les messages de partage pour optimiser conversion
- **P2** : Marketplace de leads pour Top Performers
- **P2** : Application mobile native via Capacitor

### Action items prioritaires (suite)
1. Tester massivement avec utilisateurs réels et collecter feedback
2. Ajouter analytics tracking (partages, clics raccourcis IA)
3. Pousser le code sur GitHub via "Save to Github"
4. Brancher Resend + Moneroo en prod

## Date de mise à jour
2026-01-29

## Préparation déploiement Vercel ✅
- Schéma Prisma migré sur **PostgreSQL** (provider postgres + directUrl)
- Coach IA porté en **TypeScript natif Next.js** (compatible Vercel sans Python)
- **Build de production validé**
- Documentation déploiement complète : `/app/DEPLOIEMENT_VERCEL.md`

## Améliorations ajoutées post-déploiement (Vague 8) ✅
- **CelebrationToaster repositionné** (top-20 au lieu de top-5) + auto-dismiss après 8s — ne cache plus le menu utilisateur
- **Programme "Parrain du Mois"** : composant `parrain-du-mois.tsx` affichant le top recruteur du mois avec bonus +5% sur 30 jours
- **Page publique `/top-partenaires`** : Hall of Fame étendu, SEO friendly, stats globales, CTA d'inscription
- **OG Image dynamique** `/api/og?code=XXX&product=YYY` : génère un visuel 1200x630 personnalisé pour chaque partenaire (utilisé par Facebook/Twitter/WhatsApp preview)
- **Meta OG améliorés** sur `/p/[code]` : visuels et descriptions automatiques pour le partage social
- **Liens nav** "🏆 Top Partenaires" ajoutés au header et footer

EOF