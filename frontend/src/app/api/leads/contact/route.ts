import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const partnerId = fd.get("partnerId") as string;
  const name = fd.get("name") as string;
  const phone = (fd.get("phone") as string) || null;
  const email = (fd.get("email") as string) || null;
  const message = (fd.get("message") as string) || null;

  if (!partnerId || !name) {
    return NextResponse.redirect(new URL("/erreur", req.url));
  }

  await prisma.prospect.create({
    data: {
      id: `pct_${Date.now()}`,
      userId: partnerId,
      name,
      contact: phone ?? email ?? "",
      status: "CONTACTED",
    },
  });

  return NextResponse.redirect(new URL(`/merci?type=contact`, req.url));
}
