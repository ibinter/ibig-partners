"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Charge le chat Tawk.to UNIQUEMENT sur les pages publiques.
 * Sur l'espace privé (/espace) et l'admin (/admin), le script n'est pas injecté
 * du tout — le chat commercial n'a pas lieu d'être là. (Le composant
 * TawkVisibility reste en complément pour masquer le widget en cas de
 * navigation SPA depuis une page publique où Tawk était déjà chargé.)
 */
export function TawkChat() {
  const pathname = usePathname() || "/";
  const isInternal = pathname.startsWith("/espace") || pathname.startsWith("/admin");
  if (isInternal) return null;

  return (
    <Script id="tawk-to-ibig-partners" strategy="afterInteractive">
      {`
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        Tawk_API.customStyle = {
          visibility: {
            desktop: { position: 'bl', xOffset: 15, yOffset: 15 },
            mobile:  { position: 'bl', xOffset: 5,  yOffset: 70 }
          }
        };
        Tawk_API.visitor = {
          name:  'Visiteur IBIG PARTNERS',
          email: 'visitor@ibigpartners.com'
        };
        Tawk_API.onLoad = function(){
          if (typeof Tawk_API.addTags === 'function') {
            Tawk_API.addTags(['ibig-partners','affiliation'], function(){});
          }
        };
        (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/6a1ee383d0b6e01c2e34b6be/1jsd4l37i';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `}
    </Script>
  );
}
