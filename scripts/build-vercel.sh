#!/bin/bash
set -e

echo "=== Step 1: Prisma Generate ==="
export DATABASE_URL="${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}"
cd packages/database
npx prisma generate

echo "=== Step 2: Next Build ==="
cd ../../apps/web
npx next build

echo "=== Build completed ==="
echo "Output directory contents:"
ls -la .next/
