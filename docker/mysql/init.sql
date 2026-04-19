-- Initialize database tables
CREATE DATABASE IF NOT EXISTS blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'bloguser'@'%' IDENTIFIED BY 'blogpassword';
GRANT ALL PRIVILEGES ON blog.* TO 'bloguser'@'%';
FLUSH PRIVILEGES;
