-- Up

CREATE TABLE Messages(
  id INTEGER PRIMARY KEY,
  message STRING
);

CREATE TABLE Users(
  id INTEGER PRIMARY KEY,
  username STRING UNIQUE,
  passwordHash STRING
);

CREATE TABLE AuthTokens (
  token STRING PRIMARY KEY,
  userId INTEGER,
  FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Down

DROP TABLE Messages;
DROP TABLE Users;
DROP TABLE AuthTokens