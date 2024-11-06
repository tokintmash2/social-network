CREATE TABLE followers (
    follower_id INTEGER,
    followed_id INTEGER,
    status TEXT CHECK (status IN ('pending', 'accepted')),
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (followed_id) REFERENCES users(id)
);