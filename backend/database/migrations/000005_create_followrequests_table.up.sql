CREATE TABLE followrequests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_fk_users INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user_fk_users INTEGER REFERENCES users(id) ON DELETE CASCADE
);