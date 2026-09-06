<?php
/**
 * IBIG PARTNERS — Tracking Affilié pour ibig-eduform.com
 * =========================================================
 * Fichier à intégrer sur ibig-eduform.com (site PHP).
 *
 * FONCTIONNEMENT :
 *   1. ibig_affiliate_tracker_init()  → à appeler dans le header de chaque page
 *      Lit ?ibig_ref=AFF-XXXX-001 dans l'URL et le stocke en session + cookie 30j
 *
 *   2. ibig_affiliate_report_sale()   → à appeler quand un paiement/inscription est CONFIRMÉ
 *      Notifie ibigpartners.com via POST /api/partners/report-sale
 *
 * INSTALLATION :
 *   - Copiez ce fichier sur le serveur : ex. /includes/ibig-affiliate.php
 *   - Dans votre header.php (ou équivalent) : require_once 'includes/ibig-affiliate.php'; ibig_affiliate_tracker_init();
 *   - Après confirmation de paiement : ibig_affiliate_report_sale($formationSlug, $orderId, $montant, $nomClient, $emailClient);
 *
 * CLÉ API :
 *   Définissez la constante IBIG_PARTNERS_API_KEY avec la valeur de PARTNER_SALE_API_KEY
 *   depuis le dashboard Vercel du projet ibig-partners.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

if (!defined('IBIG_PARTNERS_API_KEY')) {
    // Remplacez par la vraie valeur de PARTNER_SALE_API_KEY (Vercel → ibig-partners → Settings → Env Vars)
    define('IBIG_PARTNERS_API_KEY', 'sk_live_REMPLACER_PAR_LA_VRAIE_CLE');
}

if (!defined('IBIG_PARTNERS_REPORT_URL')) {
    define('IBIG_PARTNERS_REPORT_URL', 'https://ibigpartners.com/api/partners/report-sale');
}

// Slug du produit EDUFORM dans le catalogue ibig-partners
// (doit correspondre exactement au slug enregistré dans la branche EDUFORM)
if (!defined('IBIG_EDUFORM_PRODUCT_SLUG')) {
    define('IBIG_EDUFORM_PRODUCT_SLUG', 'ibig-eduform');
}

// Durée du cookie de tracking affilié (30 jours)
if (!defined('IBIG_AFFILIATE_COOKIE_DAYS')) {
    define('IBIG_AFFILIATE_COOKIE_DAYS', 30);
}

// ─── 1. Initialisation du tracking ───────────────────────────────────────────

/**
 * À appeler dans le header de chaque page PHP.
 * Capture ?ibig_ref=XXX depuis l'URL et le persist en session + cookie.
 */
function ibig_affiliate_tracker_init() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $ref = isset($_GET['ibig_ref']) ? trim($_GET['ibig_ref']) : null;

    // Valider le format (lettres, chiffres, tirets, 4-30 caractères)
    if ($ref && preg_match('/^[A-Z0-9\-]{4,30}$/i', $ref)) {
        $_SESSION['ibig_affiliate_ref']    = strtoupper($ref);
        $_SESSION['ibig_affiliate_ref_at'] = time();

        // Cookie 30 jours pour persister entre les sessions
        $expires = time() + (IBIG_AFFILIATE_COOKIE_DAYS * 24 * 3600);
        setcookie('ibig_affiliate_ref',    strtoupper($ref), $expires, '/', '', true, true);
        setcookie('ibig_affiliate_ref_at', (string)time(),   $expires, '/', '', true, true);
        return;
    }

    // Pas de ref dans l'URL : restaure depuis le cookie si la session est vide
    if (empty($_SESSION['ibig_affiliate_ref'])) {
        $cookieRef = isset($_COOKIE['ibig_affiliate_ref']) ? trim($_COOKIE['ibig_affiliate_ref']) : null;
        $cookieAt  = isset($_COOKIE['ibig_affiliate_ref_at']) ? (int)$_COOKIE['ibig_affiliate_ref_at'] : 0;

        if ($cookieRef && preg_match('/^[A-Z0-9\-]{4,30}$/i', $cookieRef)) {
            $maxAge = IBIG_AFFILIATE_COOKIE_DAYS * 24 * 3600;
            if ((time() - $cookieAt) < $maxAge) {
                $_SESSION['ibig_affiliate_ref']    = strtoupper($cookieRef);
                $_SESSION['ibig_affiliate_ref_at'] = $cookieAt;
            }
        }
    }
}

// ─── 2. Récupérer le code affilié actif ──────────────────────────────────────

/**
 * Retourne le code affilié actif (depuis session ou cookie), ou null si absent/expiré.
 */
function ibig_affiliate_get_ref() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $ref = isset($_SESSION['ibig_affiliate_ref']) ? $_SESSION['ibig_affiliate_ref'] : null;
    $at  = isset($_SESSION['ibig_affiliate_ref_at']) ? (int)$_SESSION['ibig_affiliate_ref_at'] : 0;

    if (!$ref) return null;

    $maxAge = IBIG_AFFILIATE_COOKIE_DAYS * 24 * 3600;
    if ((time() - $at) >= $maxAge) {
        // Expiré
        unset($_SESSION['ibig_affiliate_ref'], $_SESSION['ibig_affiliate_ref_at']);
        return null;
    }

    return $ref;
}

// ─── 3. Notifier ibigpartners.com d'une vente confirmée ─────────────────────

/**
 * À appeler immédiatement après confirmation de paiement ou d'inscription.
 *
 * @param string      $formationSlug  Slug unique de la formation (ex. "compta-gestion-pme")
 * @param string      $orderId        ID unique de la commande/inscription sur eduform
 * @param int|float   $montant        Montant payé en FCFA (0 si non communiqué)
 * @param string      $nomClient      Nom complet du client (optionnel)
 * @param string      $emailClient    Email du client (optionnel)
 *
 * @return bool  true si la notification a réussi, false sinon
 */
function ibig_affiliate_report_sale($formationSlug, $orderId, $montant = 0, $nomClient = '', $emailClient = '') {
    $partnerCode = ibig_affiliate_get_ref();

    if (!$partnerCode) {
        // Aucun parrain : pas de notification à envoyer
        return false;
    }

    $apiKey = IBIG_PARTNERS_API_KEY;
    if (!$apiKey || strpos($apiKey, 'REMPLACER') !== false) {
        error_log('[IBIG AFFILIATE] IBIG_PARTNERS_API_KEY non configurée.');
        return false;
    }

    // Construit un externalRef unique et reproductible (idempotence)
    $externalRef = 'EDUFORM-' . strtoupper($formationSlug) . '-' . $orderId;

    $payload = json_encode([
        'partnerCode'   => $partnerCode,
        'productSlug'   => IBIG_EDUFORM_PRODUCT_SLUG,
        'externalRef'   => $externalRef,
        'amount'        => (int)$montant,
        'customerName'  => $nomClient  ?: 'Client EDUFORM',
        'customerEmail' => $emailClient ?: '',
    ]);

    $ch = curl_init(IBIG_PARTNERS_REPORT_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-partner-api-key: ' . $apiKey,
        ],
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        error_log('[IBIG AFFILIATE] cURL error: ' . $curlErr);
        return false;
    }

    if ($httpCode === 200 || $httpCode === 201) {
        // Succès : efface le ref pour éviter un double-comptage sur un prochain achat non affilié
        // (optionnel — commenter si vous préférez garder le ref actif)
        // unset($_SESSION['ibig_affiliate_ref'], $_SESSION['ibig_affiliate_ref_at']);
        return true;
    }

    error_log('[IBIG AFFILIATE] HTTP ' . $httpCode . ' — ' . $response);
    return false;
}


// ─── EXEMPLE D'UTILISATION ────────────────────────────────────────────────────
//
// Dans header.php (toutes les pages) :
// ─────────────────────────────────────
//   require_once __DIR__ . '/includes/ibig-affiliate.php';
//   ibig_affiliate_tracker_init();
//
//
// Dans la page de confirmation de paiement / inscription :
// ──────────────────────────────────────────────────────────
//   // Exemple avec une commande confirmée :
//   $formation_slug = 'compta-gestion-pme';   // slug de la formation
//   $order_id       = $commande['id'];          // ID unique dans votre BDD
//   $montant        = $commande['montant'];     // en FCFA
//   $nom_client     = $commande['nom'];
//   $email_client   = $commande['email'];
//
//   $ok = ibig_affiliate_report_sale(
//       $formation_slug,
//       $order_id,
//       $montant,
//       $nom_client,
//       $email_client
//   );
//
//   if ($ok) {
//       // Vente correctement remontée à ibigpartners.com
//   }
