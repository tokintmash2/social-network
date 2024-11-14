CREATE TABLE post_access (
    post_id INTEGER NOT NULL,
    follower_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, follower_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id),
    FOREIGN KEY (follower_id) REFERENCES users(id)
);
