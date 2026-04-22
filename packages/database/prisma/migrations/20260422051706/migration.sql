/*
  Warnings:

  - You are about to drop the `widgets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "widgets";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "premium_price" DECIMAL DEFAULT 0,
    "cover_image" TEXT,
    "published_at" DATETIME,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "ai_task_id" TEXT,
    "download_enabled" BOOLEAN NOT NULL DEFAULT false,
    "download_file" TEXT,
    "download_file_name" TEXT,
    "download_file_size" BIGINT,
    "download_is_free" BOOLEAN NOT NULL DEFAULT true,
    "download_price" DECIMAL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_articles" ("ai_generated", "ai_task_id", "author_id", "cover_image", "created_at", "download_count", "download_enabled", "download_file", "download_file_name", "download_file_size", "download_is_free", "download_price", "id", "is_premium", "premium_price", "published_at", "slug", "status", "updated_at", "view_count") SELECT "ai_generated", "ai_task_id", "author_id", "cover_image", "created_at", "download_count", "download_enabled", "download_file", "download_file_name", "download_file_size", "download_is_free", "download_price", "id", "is_premium", "premium_price", "published_at", "slug", "status", "updated_at", "view_count" FROM "articles";
DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
