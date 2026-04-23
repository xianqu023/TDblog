/*
  Warnings:

  - Added the required column `theme_id` to the `themes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "theme_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "author" TEXT,
    "thumbnail" TEXT,
    "preview_url" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_themes" ("config", "created_at", "description", "id", "is_active", "is_default", "name", "preview_url", "slug", "sort_order", "updated_at") SELECT "config", "created_at", "description", "id", "is_active", "is_default", "name", "preview_url", "slug", "sort_order", "updated_at" FROM "themes";
DROP TABLE "themes";
ALTER TABLE "new_themes" RENAME TO "themes";
CREATE UNIQUE INDEX "themes_theme_id_key" ON "themes"("theme_id");
CREATE UNIQUE INDEX "themes_slug_key" ON "themes"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
