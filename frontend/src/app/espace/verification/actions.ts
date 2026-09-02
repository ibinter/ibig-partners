"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitVerification(formData: FormData) {
  const user = await requireUser();

  const partnerType = String(formData.get("partnerType") ?? "INDIVIDUAL");

  // ── Shared payment fields ──
  const g = (k: string) => formData.get(k) ? String(formData.get(k)) : null;
  const payoutMethod          = String(formData.get("payoutMethod") ?? "ORANGE_MONEY");
  const mobileMoneyNum        = g("mobileMoneyNum");
  const mobileMoneyOperator   = g("mobileMoneyOperator");
  const paypalEmail           = g("paypalEmail");
  const wiseEmail             = g("wiseEmail");
  const skrillEmail           = g("skrillEmail");
  const rib                   = g("rib");
  const bankName              = g("bankName");
  const bankCountry           = g("bankCountry");
  const swift                 = g("swift");
  const iban                  = g("iban");
  const bankAccountNum        = g("bankAccountNum");
  const bankBranch            = g("bankBranch");
  const westernUnionName      = g("westernUnionName");
  const moneyGramName         = g("moneyGramName");
  const riaName               = g("riaName");
  const expressUnionNum       = g("expressUnionNum");
  const cryptoCurrency        = g("cryptoCurrency");
  const cryptoNetwork         = g("cryptoNetwork");
  const cryptoAddress         = g("cryptoAddress");
  const chequePayable         = g("chequePayable");
  const chequeBank            = g("chequeBank");
  const cinetpayPhone         = g("cinetpayPhone");
  const kkiapayPhone          = g("kkiapayPhone");
  const tmoneyPhone           = g("tmoneyPhone");
  const floozPhone            = g("floozPhone");

  // ── Méthodes secondaires (JSON) ──
  const buildSecondaryDetails = (prefix: string) => {
    const entries: Record<string, string> = {};
    for (const [key, val] of formData.entries()) {
      if (key.startsWith(`${prefix}_`) && !key.endsWith("_prefill") && val) {
        entries[key.replace(`${prefix}_`, "")] = String(val);
      }
    }
    return Object.keys(entries).length > 0 ? JSON.stringify(entries) : null;
  };
  const payoutMethod2  = g("payoutMethod2") || null;
  const payoutDetails2 = payoutMethod2 ? buildSecondaryDetails("sec2") : null;
  const payoutMethod3  = g("payoutMethod3") || null;
  const payoutDetails3 = payoutMethod3 ? buildSecondaryDetails("sec3") : null;

  // ── INDIVIDUAL fields ──
  const fullName      = formData.get("fullName")      ? String(formData.get("fullName"))      : null;
  const idType        = formData.get("idType")        ? String(formData.get("idType"))        : null;
  const idNumber      = formData.get("idNumber")      ? String(formData.get("idNumber"))      : null;
  const cvText        = formData.get("cvText")        ? String(formData.get("cvText"))        : null;
  const idDocUrl      = formData.get("idDocUrl")      ? String(formData.get("idDocUrl"))      : null;
  const idDocBack     = formData.get("idDocBack")     ? String(formData.get("idDocBack"))     : null;
  const cvFileUrl     = formData.get("cvFileUrl")     ? String(formData.get("cvFileUrl"))     : null;
  const country       = formData.get("country")       ? String(formData.get("country"))       : null;
  const city          = formData.get("city")          ? String(formData.get("city"))          : null;
  const profession    = formData.get("profession")    ? String(formData.get("profession"))    : null;
  const whatsapp      = formData.get("whatsapp")      ? String(formData.get("whatsapp"))      : null;
  const secondPhone   = formData.get("secondPhone")   ? String(formData.get("secondPhone"))   : null;
  const contact1Name  = formData.get("contact1Name")  ? String(formData.get("contact1Name"))  : null;
  const contact1Phone = formData.get("contact1Phone") ? String(formData.get("contact1Phone")) : null;
  const contact2Name  = formData.get("contact2Name")  ? String(formData.get("contact2Name"))  : null;
  const contact2Phone = formData.get("contact2Phone") ? String(formData.get("contact2Phone")) : null;

  // ── COMPANY fields ──
  const companyName     = formData.get("companyName")     ? String(formData.get("companyName"))     : null;
  const rccm            = formData.get("rccm")            ? String(formData.get("rccm"))            : null;
  const nif             = formData.get("nif")             ? String(formData.get("nif"))             : null;
  const compteContrib   = formData.get("compteContrib")   ? String(formData.get("compteContrib"))   : null;
  const legalRep        = formData.get("legalRep")        ? String(formData.get("legalRep"))        : null;
  const legalRepTitle   = formData.get("legalRepTitle")   ? String(formData.get("legalRepTitle"))   : null;
  const companyCountry  = formData.get("companyCountry")  ? String(formData.get("companyCountry"))  : null;
  const companyCity     = formData.get("companyCity")     ? String(formData.get("companyCity"))     : null;
  const companyAddress  = formData.get("companyAddress")  ? String(formData.get("companyAddress"))  : null;
  const companyEmail    = formData.get("companyEmail")    ? String(formData.get("companyEmail"))    : null;
  const companyWhatsapp = formData.get("companyWhatsapp") ? String(formData.get("companyWhatsapp")) : null;
  const companyPhone2   = formData.get("companyPhone2")   ? String(formData.get("companyPhone2"))   : null;

  await prisma.$transaction([
    prisma.verificationRequest.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        type: partnerType,
        // individual
        fullName, idType, idNumber, cvText, idDocUrl, idDocBack, cvFileUrl,
        country, city, profession, whatsapp, secondPhone,
        contact1Name, contact1Phone, contact2Name, contact2Phone,
        // company
        companyName, rccm, nif, compteContrib, legalRep, legalRepTitle,
        companyCountry, companyCity, companyAddress, companyEmail,
        companyWhatsapp, companyPhone2,
        // payment
        payoutMethod, mobileMoneyNum, mobileMoneyOperator,
        paypalEmail, wiseEmail, skrillEmail,
        rib, bankName, bankCountry, swift, iban, bankAccountNum, bankBranch,
        westernUnionName, moneyGramName, riaName, expressUnionNum,
        cryptoCurrency, cryptoNetwork, cryptoAddress,
        chequePayable, chequeBank,
        cinetpayPhone, kkiapayPhone, tmoneyPhone, floozPhone,
        payoutMethod2, payoutDetails2, payoutMethod3, payoutDetails3,
        status: "PENDING",
        submittedAt: new Date(),
      },
      update: {
        type: partnerType,
        // individual
        fullName, idType, idNumber, cvText, idDocUrl, idDocBack, cvFileUrl,
        country, city, profession, whatsapp, secondPhone,
        contact1Name, contact1Phone, contact2Name, contact2Phone,
        // company
        companyName, rccm, nif, compteContrib, legalRep, legalRepTitle,
        companyCountry, companyCity, companyAddress, companyEmail,
        companyWhatsapp, companyPhone2,
        // payment
        payoutMethod, mobileMoneyNum, mobileMoneyOperator,
        paypalEmail, wiseEmail, skrillEmail,
        rib, bankName, bankCountry, swift, iban, bankAccountNum, bankBranch,
        westernUnionName, moneyGramName, riaName, expressUnionNum,
        cryptoCurrency, cryptoNetwork, cryptoAddress,
        chequePayable, chequeBank,
        cinetpayPhone, kkiapayPhone, tmoneyPhone, floozPhone,
        payoutMethod2, payoutDetails2, payoutMethod3, payoutDetails3,
        status: "PENDING",
        submittedAt: new Date(),
        reviewNote: null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: "SUBMITTED",
        partnerType,
      },
    }),
  ]);

  redirect("/espace/verification");
}
