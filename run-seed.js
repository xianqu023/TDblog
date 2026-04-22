const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'packages', 'database', 'prisma', 'blog.db');

// SQL 脚本路径
const sqlPath = path.join(__dirname, 'reset-and-seed.sql');

// 读取 SQL 脚本
const sql = fs.readFileSync(sqlPath, 'utf8');

// 连接数据库
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the database.');

  // 执行 SQL 脚本
  db.exec(sql, (err) => {
    if (err) {
      console.error('Error executing SQL:', err.message);
    } else {
      console.log('Seed data executed successfully!');
      console.log('\n📊 Summary:');
      console.log('✅ 20 articles created');
      console.log('✅ Categories and tags added');
      console.log('✅ Translations added for each article');
      console.log('✅ Cover images generated');
    }
    
    // 关闭数据库连接
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
});