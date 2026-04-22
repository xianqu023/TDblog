import { defineConfig } from 'prisma/config';
import path from 'path';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || `file:${path.resolve(__dirname, 'prisma', 'blog.db')}`,
  },
});
