# Flux catalogue IBIG — Spécification (Voie A)

Ce document décrit le **contrat d'API** que chaque plateforme IBIG (EDUFORM, SOFT,
Scolaby, IMMO TRUST, etc.) doit exposer pour que **IBIG PARTNERS** synchronise
son catalogue **automatiquement et en direct**.

Une fois qu'une plateforme expose ce flux, il suffit de configurer son URL dans
PARTNERS (voir « Activation ») — **aucun changement de code** côté PARTNERS.

---

## 1. Endpoint à exposer

```
GET https://<votre-plateforme>/api/catalogue
```

- **Méthode** : `GET`
- **Réponse** : `200 OK`, `Content-Type: application/json`
- **HTTPS obligatoire**. Le domaine doit appartenir à un domaine IBIG connu
  (ex. `*.ibigsoft.com`, `ibig-eduform.com`, `scolaby.com`…).

### Authentification (optionnelle mais recommandée)
Si un jeton est convenu, PARTNERS l'enverra ainsi :
```
Authorization: Bearer <CATALOG_FEED_TOKEN>
```
Votre endpoint peut vérifier ce jeton et renvoyer `401` s'il est absent/incorrect.

---

## 2. Format de la réponse

```json
{
  "branch": "ibig-eduform",
  "products": [
    {
      "slug": "eduform-compta-syscohada",
      "name": "Formation Comptabilité SYSCOHADA",
      "pricingType": "COURSE",
      "price": 150000,
      "rate": 10,
      "siteUrl": "https://ibig-eduform.com/formations/compta-syscohada",
      "description": "Formation certifiante de 5 jours à la comptabilité SYSCOHADA…"
    }
  ]
}
```

Le champ racine `products` (tableau) est **obligatoire**. `branch` est informatif.
(Un tableau JSON simple `[ {…}, {…} ]` est aussi accepté.)

### Champs d'un produit

| Champ | Type | Requis | Règles |
|-------|------|:---:|--------|
| `slug` | string | ✅ | Identifiant **unique et stable** (kebab-case). Sert de clé — ne le change jamais pour un même produit. |
| `name` | string | ✅ | Nom affiché. |
| `pricingType` | string | ✅ | L'une de : `MONTHLY_SUB`, `ANNUAL_SUB`, `COURSE`, `SERVICE`, `PRODUCT`. |
| `price` | number | ✅ | Prix en FCFA, entier ≥ 0 (`0` = « sur devis »). Pas de séparateur de milliers. |
| `rate` | number | ✅ | Taux de commission N1 en %, entre 0 et 100. |
| `siteUrl` | string | ❌ | URL publique de l'offre. |
| `description` | string | ❌ | Description courte. |

### Contraintes
- Au moins **1 produit**, au plus **5000**.
- `slug` **unique** dans le flux (les doublons invalident tout le flux).
- Tout élément non conforme (type incorrect, `pricingType` inconnu, prix négatif…)
  **invalide l'intégralité du flux** → PARTNERS garde alors son catalogue précédent
  (sécurité : un flux cassé ne vide jamais le catalogue).

---

## 3. Comment PARTNERS l'utilise

À chaque synchronisation (cron quotidien ou déclenchement admin) :
1. PARTNERS lit l'URL de flux configurée pour la branche.
2. Il récupère le JSON (timeout 10 s), le **valide strictement**.
3. Si valide → il **compare** avec son catalogue, applique les changements
   (ajout / mise à jour / retrait des produits **sans vente ni lien** rattaché)
   et crée une **notification** dans la cloche des affiliés en cas de changement.
4. Si le flux est absent, injoignable ou invalide → **repli automatique** sur le
   catalogue interne (aucune perte).

> Un produit ayant déjà des ventes ou des liens d'affiliation n'est jamais
> supprimé automatiquement, même s'il disparaît du flux (il est conservé).

---

## 4. Activation côté PARTNERS (à faire une fois par plateforme)

Deux options, sans redéploiement :

**A. Via l'API admin** (recommandé) — un ADMIN/SUPERADMIN appelle :
```bash
curl -X POST https://ibigpartners.com/api/admin/catalog-feeds \
  -H "Content-Type: application/json" \
  --cookie "<session admin>" \
  -d '{ "branchSlug": "ibig-eduform", "url": "https://ibig-eduform.com/api/catalogue" }'
```
Pour **retirer** un flux (repasser au catalogue interne) : envoyez `"url": ""`.

**B. Via variable d'environnement** :
```
CATALOG_FEED_IBIG_EDUFORM = https://ibig-eduform.com/api/catalogue
```
(nom = `CATALOG_FEED_` + slug de branche en MAJUSCULES, tirets → underscores.)

Jeton partagé optionnel : `CATALOG_FEED_TOKEN`.

---

## 5. Implémentation de référence

PARTNERS expose lui-même le catalogue au bon format, utile comme modèle :
```
GET https://ibigpartners.com/api/catalogue/<branchSlug>
```
Exemple : `https://ibigpartners.com/api/catalogue/ibig-soft`

Slugs de branches : `ibig-soft`, `ibig-eduform`, `ibig-immo-trust`, `ibig-market`,
`ibig-digital`, `ibig-digital-kits`, `ibig-conseil-plus`, `ibig-partners-branch`,
`ibig-multiservices`.
