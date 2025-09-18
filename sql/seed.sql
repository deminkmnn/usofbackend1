-- Вимикаємо перевірку FK на час вставки
SET FOREIGN_KEY_CHECKS = 0;

-- Очищення таблиць
TRUNCATE TABLE Likes;
TRUNCATE TABLE Comments;
TRUNCATE TABLE PostCategories;
TRUNCATE TABLE Posts;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Users;

-- Включаємо перевірку FK
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------- USERS -----------------
INSERT INTO Users (login, password, full_name, email, role)
VALUES
('admin', '$2b$10$5wD7cQ2jZQKJq6nE9rA8yOkqHkzK5w6n6m2l0mHf0b5xwB7EwCw9C', 'Admin User', 'admin@example.com', 'admin'),
('john',  '$2b$10$5wD7cQ2jZQKJq6nE9rA8yOkqHkzK5w6n6m2l0mHf0b5xwB7EwCw9C', 'John Doe',  'john@example.com',  'user'),
('jane',  '$2b$10$5wD7cQ2jZQKJq6nE9rA8yOkqHkzK5w6n6m2l0mHf0b5xwB7EwCw9C', 'Jane Smith','jane@example.com',  'user'),
('alice', '$2b$10$5wD7cQ2jZQKJq6nE9rA8yOkqHkzK5w6n6m2l0mHf0b5xwB7EwCw9C', 'Alice Lee', 'alice@example.com', 'user'),
('bob',   '$2b$10$5wD7cQ2jZQKJq6nE9rA8yOkqHkzK5w6n6m2l0mHf0b5xwB7EwCw9C', 'Bob Ray',   'bob@example.com',   'user');

-- ----------------- CATEGORIES -----------------
INSERT INTO Categories (title, description) VALUES
('JavaScript','Everything about JS'),
('Databases','SQL/NoSQL'),
('Backend','Node, APIs'),
('Frontend','UI frameworks'),
('DevOps','CI/CD');

-- ----------------- POSTS -----------------
INSERT INTO Posts (author_id, title, content, status) VALUES
(2,'Help with middleware','How to write custom middleware?','active'),
(3,'MySQL JOIN','Explain LEFT JOIN pls','active'),
(4,'Center a div','CSS centering tips','active'),
(5,'Docker basics','How to run Node in Docker','inactive'),
(2,'What is REST','Explain REST principles','active');

-- ----------------- POST CATEGORIES -----------------
INSERT INTO PostCategories (post_id, category_id) VALUES
(1,3),(2,2),(3,4),(4,5),(5,3);

-- ----------------- COMMENTS -----------------
INSERT INTO Comments (post_id, author_id, content, status) VALUES
(1,3,'Use app.use()', 'active'),
(1,4,'Remember next()', 'active'),
(2,5,'LEFT JOIN returns all left', 'active'),
(3,2,'Use flex or grid', 'inactive'),
(5,3,'REST = resources + verbs', 'active');

-- ----------------- LIKES -----------------
INSERT INTO Likes (author_id, target_id, target_type, type) VALUES
(3,1,'post','like'),
(4,1,'post','like'),
(5,2,'post','dislike'),
(2,1,'comment','like'),
(5,3,'comment','like');
