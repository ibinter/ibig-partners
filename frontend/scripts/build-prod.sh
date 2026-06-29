#!/bin/sh
# Script de build production.
# Remplace le provider sqlite par postgresql dans le schéma Prisma,
# génère le client Prisma, puis lance le build Next.js.

set -e

echo "→ Switching Prisma provider: sqlite → postgresql"
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "→ prisma generate"
npx prisma generate

echo "→ next build"
npx next build
