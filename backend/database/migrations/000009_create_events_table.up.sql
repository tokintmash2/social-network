CREATE TABLE events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date_time TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
