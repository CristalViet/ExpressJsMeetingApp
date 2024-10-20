# ExpressJsMeetingApp


setup npm 


npm init -y
npm install express socket.io simple-peer
npm install mongoose
npm install nodemailer
npm install socket.io-client --save
npm install nodemon --save-dev
npm install electron --save-dev
npm install socket.io
npm install mysql2
npm install bcrypt
npm install sequelize sequelize-cli
npm install jsonwebtoken




Cài đặt OpenSSL
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
node server.js




Tao csdl 
-- Tạo cơ sở dữ liệu
CREATE DATABASE ChatApplication;
USE ChatApplication;

-- Bảng Users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Chats
CREATE TABLE Chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL
);

-- Bảng Messages
CREATE TABLE Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT,
    sender_id INT,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- Bảng ChatMembers
CREATE TABLE ChatMembers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT,
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE (chat_id, user_id)
);

-- Bảng Rooms (Họp)
CREATE TABLE Rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL
);

-- Bảng RoomMembers
CREATE TABLE RoomMembers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE (room_id, user_id)
);

-- Bảng Documents (nếu bạn cần lưu tài liệu)
CREATE TABLE Documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT,
    user_id INT,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);