INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) VALUES ("asd@asd.ee", "$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC", "asd", "asd", "1990-03-01 00:00:00+00:00", "asd", "testuser", "default_avatar.jpg");
INSERT INTO users (email, password, first_name, last_name, dob, username, about_me, avatar) VALUES ("qwe@qwe.ee", "$2a$10$SoSjc4fBxSbXvl1R15ispOhE70e2tZoLAzISkc.2Ky8hzysC7FNbC", "qwe", "qwe", "1990-03-01 00:00:00+00:00", "qwe", "testuser", "default_avatar.jpg");

INSERT INTO posts (user_id, content, privacy_setting) VALUES (1, "Test post content for User 1", "public");
INSERT INTO posts (user_id, content, privacy_setting) VALUES (2, "Test post content for User 2", "private");
INSERT INTO posts (user_id, content, privacy_setting) VALUES (3, "Test post content for User 3", "custom");

INSERT INTO post_access (post_id, follower_id) VALUES (3, 2);