#!/bin/bash
set -e

# 设置默认 DATABASE_URL（如果未提供）
export DATABASE_URL="${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}"

echo "Running prisma generate..."
cd packages/database
npx prisma generate

echo "Running next build..."
cd ../..
cd apps/web
npx next build

echo "Build completed successfully!"
