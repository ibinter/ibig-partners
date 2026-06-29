"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitVerification(formData: FormData) {
  const user = await requireUser();

  const partnerType = String(formData.get("partnerType") ?? "INDIVIDUAL");

  // ── Shared payment fields ──
  const payoutMethod = String(formData.get("payoutMethod") ?? "ORANGE_MONEY");
  const mobileMoneyNum = formData.get("mobileMoneyNum") ? String(formData.get("mobileMoneyNum")) : null;
  const paypalEmail    = formData.get("paypalEmail")    ? String(formData.get("paypalEmail"))    : null;
  const rib            = formData.get("rib")            ? String(formData.get("rib"))            : null;
  const bankName       = formData.get("bankName")       ? String(formData.get("bankName"))       : null;
  const bankCountry    = formData.get("bankCountry")    ? String(formData.get("bankCountry"))    : null;
  const swift          = formData.get("swift")          ? String(formData.get("swift"))          : null;
  const iban           = formData.get("iban")           ? String(formData.get("iban"))           : null;
  const westernUnionName = formData.get("westernUnionName") ? String(formData.get("westernUnionName")) : null;

  // ── INDIVIDUAL fields ──
  const fullName      = formData.get("fullName")      ? String(formData.get("fullName"))      : null;
  const idType        = formData.get("idType")        ? String(formData.get("idType"))        : null;
  const idNumber      = formData.get("idNumber")      ? String(formData.get("idNumber"))      : null;
  const cvText        = formData.get("cvText")        ? String(formData.get("cvText"))        : null;
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
        fullName, idType, idNumber, cvText,
        country, city, profession, whatsapp, secondPhone,
        contact1Name, contact1Phone, contact2Name, contact2Phone,
        // company
        companyName, rccm, nif, compteContrib, legalRep, legalRepTitle,
        companyCountry, companyCity, companyAddress, companyEmail,
        companyWhatsapp, companyPhone2,
        // payment
        payoutMethod, mobileMoneyNum, paypalEmail,
        rib, bankName, bankCountry, swift, iban, westernUnionName,
        status: "PENDING",
        submittedAt: new Date(),
      },
      update: {
        type: partnerType,
        // individual
        fullName, idType, idNumber, cvText,
        country, city, profession, whatsapp, secondPhone,
        contact1Name, contact1Phone, contact2Name, contact2Phone,
        // company
        companyName, rccm, nif, compteContrib, legalRep, legalRepTitle,
        companyCountry, companyCity, companyAddress, companyEmail,
        companyWhatsapp, companyPhone2,
        // payment
        payoutMethod, mobileMoneyNum, paypalEmail,
        rib, bankName, bankCountry, swift, iban, westernUnionName,
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
