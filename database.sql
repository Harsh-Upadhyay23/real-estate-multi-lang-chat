-- ✅ Create and Use Database
CREATE DATABASE chatapp1;
USE chatapp1;

-- ✅ Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en'
);

-- ✅ Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(50) NOT NULL,
    receiver VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_lang VARCHAR(5) NOT NULL DEFAULT 'en'
);

-- ✅ Retrieve All Messages
SELECT * FROM messages;

-- ✅ Retrieve All Users
SELECT * FROM users;

-- ✅ Disable Safe Updates
SET SQL_SAFE_UPDATES = 0;

-- ✅ Delete All Records from Tables
DELETE FROM messages;
DELETE FROM users;
