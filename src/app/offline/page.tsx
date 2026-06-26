export default function OfflinePage() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hors-ligne — IBIG PARTNERS</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            padding: 24px;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 48px 40px;
            text-align: center;
            max-width: 400px;
            width: 100%;
            border: 1px solid #e2e8f0;
          }
          .icon { font-size: 56px; margin-bottom: 20px; }
          h1 { font-size: 22px; color: #0f1729; margin-bottom: 10px; }
          p { font-size: 15px; color: #5b6577; line-height: 1.6; margin-bottom: 24px; }
          a {
            display: inline-block;
            background: #0b5fff;
            color: white;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
          }
          .logo { font-size: 13px; color: #94a3b8; margin-top: 32px; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">📡</div>
          <h1>Vous êtes hors-ligne</h1>
          <p>
            Impossible de se connecter au réseau. Vérifiez votre connexion
            internet et réessayez.
          </p>
          <a href="/espace">Réessayer</a>
          <p className="logo">IBIG PARTNERS</p>
        </div>
      </body>
    </html>
  );
}
