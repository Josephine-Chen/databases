DROP DATABASE IF EXISTS chat;

CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  id INT NOT NULL PRIMARY KEY auto_increment,
  username_id INT,
  roomname_id INT,
  createdAt TIMESTAMP DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  text CHAR (255)
);

CREATE TABLE users (
  id INT NOT NULL PRIMARY KEY auto_increment,
  username CHAR (16)
);

CREATE TABLE rooms (
  id INT NOT NULL PRIMARY KEY auto_increment,
  roomname CHAR (16)
);

ALTER TABLE messages ADD FOREIGN KEY (username_id) REFERENCES users(id);
ALTER TABLE messages ADD FOREIGN KEY (roomname_id) REFERENCES rooms(id);
/* Create other tables and define schemas for them here! */

-- PLACEHOLDERS
INSERT INTO rooms (roomname) VALUES ('lobby'), ('room1'), ('room2'), ('room3');
INSERT INTO users (username) VALUES ('A'), ('B'), ('C'), ('D');
INSERT INTO messages (text, username_id, roomname_id) VALUES ('test1', 1, 1), ('test2', 3, 2), ('test3', 4, 3);


/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/
