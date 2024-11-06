CREATE TABLE group_memberships (
    membership_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);