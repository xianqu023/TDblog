import { prisma } from './src/index';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories);
    const tags = await prisma.tag.findMany();
    console.log('Tags:', tags);
    console.log('Connection test successful!');
  } catch (error) {
    console.error('Connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();