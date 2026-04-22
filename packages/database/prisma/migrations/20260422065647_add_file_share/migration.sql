-- CreateTable
CREATE TABLE "file_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "file_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "max_downloads" INTEGER,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" DATETIME,
    "password" TEXT,
    "last_downloaded_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    CONSTRAINT "file_shares_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "file_shares_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "file_shares_token_key" ON "file_shares"("token");

-- CreateIndex
CREATE INDEX "file_shares_token_idx" ON "file_shares"("token");

-- CreateIndex
CREATE INDEX "file_shares_file_id_idx" ON "file_shares"("file_id");
