DROP DATABASE chat;
CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  id INT NOT NULL PRIMARY KEY auto_increment,
  username CHAR (255),
  roomname CHAR (255),
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

-- ALTER TABLE messages ADD FOREIGN KEY (username_id) REFERENCES users(id);
-- ALTER TABLE messages ADD FOREIGN KEY (roomname_id) REFERENCES rooms(id);
/* Create other tables and define schemas for them here! */




/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/
