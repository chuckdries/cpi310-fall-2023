-- Up

CREATE TABLE Messages(
  id INTEGER PRIMARY KEY,
  message STRING,
  author STRING
);

-- Down

DROP TABLE Messages;